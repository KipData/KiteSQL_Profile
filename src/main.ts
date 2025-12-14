import initKiteSql, { WasmDatabase } from "./kite-sql-web";

const app = document.querySelector<HTMLElement>("#app");
if (!app) throw new Error("app root missing");

const assetBase = import.meta.env.BASE_URL;
const logoLight = `${assetBase}images/kite_sql_light.png`;
const logoDark = `${assetBase}images/kite_sql_dark.png`;

const ui = document.createElement("div");
ui.className = "card";
ui.innerHTML = `
  <div class="header">
    <div>
      <h1>KiteSQL Wasm Demo</h1>
      <div class="badge">In-browser SQL</div>
    </div>
    <div class="actions">
      <button id="runSql" class="primary">Run SQL</button>
      <button id="runDemo">Seed demo data</button>
      <button id="reset">Reset DB</button>
    </div>
  </div>
  <div class="section">
    <div class="section-head">
      <div>
        <div class="section-title">SQL playground</div>
        <div class="section-sub">Type any SQL or click an example pill to auto-fill.</div>
      </div>
      <div class="examples" id="examples">
        <button class="pill" data-sql="select * from t_demo order by score desc;">Top scores</button>
        <button class="pill" data-sql="select name, avg(score) as avg_score from t_demo group by name;">Group by name</button>
        <button class="pill" data-sql="select * from t_demo where score >= 95;">High scorers</button>
        <button class="pill" data-sql="update t_demo set score = score + 1 where id = 1; select * from t_demo order by id;">Update + view</button>
      </div>
    </div>
    <textarea id="sqlInput" class="sql-input" rows="6" spellcheck="false">select * from t_demo order by score desc;</textarea>
  </div>
  <div class="output" id="output">Waiting to start...</div>
  <div class="status" id="status"></div>
  <div class="footer">Runs entirely in your browser using the published <code>kite_sql</code> WebAssembly build.</div>
  <div class="powered-row">
    <div class="star-cta">Star plz <span class="finger">👉</span></div>
    <a class="powered" href="https://github.com/KipData/KiteSQL" target="_blank" rel="noreferrer">
      <span>Powered by</span>
      <img class="logo-img light" src="${logoLight}" alt="KiteSQL logo (light)" />
      <img class="logo-img dark" src="${logoDark}" alt="KiteSQL logo (dark)" />
    </a>
  </div>
`;
app.appendChild(ui);

const sqlInput = ui.querySelector<HTMLTextAreaElement>("#sqlInput")!;
const outputEl = ui.querySelector<HTMLDivElement>("#output")!;
const statusEl = ui.querySelector<HTMLDivElement>("#status")!;
const runSqlBtn = ui.querySelector<HTMLButtonElement>("#runSql")!;
const runDemoBtn = ui.querySelector<HTMLButtonElement>("#runDemo")!;
const resetBtn = ui.querySelector<HTMLButtonElement>("#reset")!;

let db: WasmDatabase | null = null;
const wasmReady = initKiteSql();

const setStatus = (text: string, ok = true) => {
  statusEl.textContent = text;
  statusEl.className = `status ${ok ? "ok" : "err"}`;
};

const unwrapValue = (val: any) => {
  if (val === undefined) return undefined;
  if (val === null) return null;
  if (typeof val === "object" && val && "value" in val) return (val as any).value;
  return val;
};

const extractValue = (v: any) => {
  const primitive =
    unwrapValue(v?.Int32) ??
    unwrapValue(v?.Int64) ??
    unwrapValue(v?.Float64) ??
    unwrapValue(v?.Utf8) ??
    unwrapValue(v?.Boolean);

  const finalValue = primitive !== undefined ? primitive : unwrapValue(v);
  if (finalValue === null || finalValue === undefined) return "null";
  if (typeof finalValue === "bigint") return finalValue.toString();
  if (typeof finalValue === "object") {
    try {
      return JSON.stringify(finalValue);
    } catch {
      return String(finalValue);
    }
  }
  return finalValue;
};

const columnNamesFromSchema = (schema: any) => {
  if (!Array.isArray(schema)) return [];
  return schema
    .map((col) => (typeof col?.name === "string" ? col.name : undefined))
    .filter((name): name is string => Boolean(name));
};

function renderRows(rows: any[], columnNames?: string[]) {
  if (!rows.length) {
    outputEl.textContent = "No rows returned.";
    return;
  }

  const columns =
    (columnNames && columnNames.length ? columnNames : undefined) ??
    rows[0]?.columns ??
    rows[0]?.keys ??
    rows[0]?.names ??
    rows[0]?.columns_names ??
    rows[0]?.columnNames ??
    rows[0]?.cols ??
    rows[0]?.values?.map((_: unknown, idx: number) => `c${idx + 1}`) ??
    [];

  const body = rows
    .map((row) => {
      const values = row.values ?? row;
      const cells = (values as any[]).map((v) => `<td>${extractValue(v)}</td>`).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  const header = (columns as any[])
    .map((c: any, idx: number) => `<th>${c ?? `c${idx + 1}`}</th>`)
    .join("");

  outputEl.innerHTML = [
    '<table class="table">',
    `<thead><tr>${header}</tr></thead>`,
    `<tbody>${body}</tbody>`,
    "</table>",
  ].join("");
}

function splitStatements(sql: string) {
  return sql
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function seedDemoData(showResult = true) {
  if (!db) await initDb(false);
  if (!db) return;

  const steps = [
    "drop table if exists t_demo",
    "create table t_demo(id int primary key, name varchar, score int)",
    "insert into t_demo values (1, 'Ada', 98), (2, 'Lin', 87), (3, 'Kai', 92), (4, 'Mia', 95)",
    "update t_demo set score = score + 2 where id in (2, 3)"
  ];

  for (const sql of steps) {
    await db.execute(sql);
  }

  if (showResult) {
    const result = db.run("select * from t_demo order by score desc");
    const schema = typeof (result as any).schema === "function" ? (result as any).schema() : null;
    const columns = columnNamesFromSchema(schema);
    const rows = result.rows();
    result.finish();
    renderRows(rows, columns ?? undefined);
    setStatus("Demo data ready ✓", true);
  } else {
    setStatus("Demo data ready ✓", true);
  }
}

async function initDb(seed = true) {
  await wasmReady;
  db?.free?.();
  db = new WasmDatabase();
  if (seed) await seedDemoData(false);
}

async function runSql(sqlText: string) {
  runSqlBtn.disabled = true;
  runDemoBtn.disabled = true;
  resetBtn.disabled = true;
  setStatus("Running SQL...");
  outputEl.textContent = "";

  try {
    if (!db) await initDb();
    const statements = splitStatements(sqlText);
    if (!statements.length) {
      setStatus("Please enter a SQL statement", false);
      return;
    }

    let lastRows: any[] | null = null;
    let lastColumns: string[] | null = null;
    for (const sql of statements) {
      const isQuery = /^(select|with|pragma|explain)/i.test(sql.trim());
      if (isQuery) {
        const result = db!.run(sql);
        const schema = typeof (result as any).schema === "function" ? (result as any).schema() : null;
        lastColumns = columnNamesFromSchema(schema);
        lastRows = result.rows();
        result.finish();
      } else {
        await db!.execute(sql);
      }
    }

    if (lastRows) {
      renderRows(lastRows, lastColumns ?? undefined);
      setStatus("Query completed ✓", true);
    } else {
      outputEl.textContent = `Executed ${statements.length} statement(s).`;
      setStatus("Done ✓", true);
    }
  } catch (err) {
    console.error(err);
    setStatus(`Error: ${(err as Error).message}`, false);
    outputEl.textContent = String(err);
  } finally {
    runSqlBtn.disabled = false;
    runDemoBtn.disabled = false;
    resetBtn.disabled = false;
  }
}

async function reset() {
  runSqlBtn.disabled = true;
  runDemoBtn.disabled = true;
  resetBtn.disabled = true;
  setStatus("Resetting DB...");
  try {
    await initDb();
    outputEl.textContent = "Reset complete. Ready.";
    setStatus("Ready");
  } catch (err) {
    console.error(err);
    setStatus(`Reset error: ${(err as Error).message}`, false);
    outputEl.textContent = String(err);
  } finally {
    runSqlBtn.disabled = false;
    runDemoBtn.disabled = false;
    resetBtn.disabled = false;
  }
}

runSqlBtn.addEventListener("click", () => void runSql(sqlInput.value));
runDemoBtn.addEventListener("click", () => {
  sqlInput.value = "select * from t_demo order by score desc;";
  void seedDemoData(true);
});
resetBtn.addEventListener("click", () => void reset());

ui.querySelectorAll<HTMLButtonElement>(".pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    const sql = pill.dataset.sql ?? "";
    sqlInput.value = sql;
    void runSql(sql);
  });
});

// Auto-init once so the first click is fast.
setStatus("Loading WebAssembly...");
initDb()
  .then(() => seedDemoData(true))
  .catch((err) => {
    console.error(err);
    outputEl.textContent = "Failed to load KiteSQL wasm bundle.";
    setStatus(`Init error: ${(err as Error).message}`, false);
  });
