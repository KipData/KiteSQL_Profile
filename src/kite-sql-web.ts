// Browser-friendly wrapper around the npm-published `kite_sql` package.
// The package ships a Node-focused glue file; this adapts it to load the wasm
// via fetch and expose the same APIs (WasmDatabase, WasmResultIter).
// Based on the upstream glue with minimal changes for ESM + browsers.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import wasmUrl from "@kipdata/kite_sql/kite_sql_bg.wasm?url";

const placeholder: any = {};
// The wasm expects its JS imports under the module name "./kite_sql_bg.js".
const imports: any = { "./kite_sql_bg.js": placeholder };
let wasm: any;

function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc_command_export();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}

function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store_command_export(idx);
  }
}

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8ArrayMemory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);

    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc_command_export(idx);
  return value;
}

let cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
function decodeText(ptr, len) {
  return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}

let WASM_VECTOR_LEN = 0;

const WasmDatabaseFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_wasmdatabase_free(ptr >>> 0, 1));

const WasmResultIterFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_wasmresultiter_free(ptr >>> 0, 1));

class WasmDatabase {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WasmDatabaseFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_wasmdatabase_free(ptr, 0);
  }
  constructor() {
    const ret = wasm.wasmdatabase_new();
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    this.__wbg_ptr = ret[0] >>> 0;
    WasmDatabaseFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * Stream results with a JS-friendly iterator that exposes `next()`.
   * @param {string} sql
   * @returns {WasmResultIter}
   */
  run(sql) {
    const ptr0 = passStringToWasm0(sql, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.wasmdatabase_run(this.__wbg_ptr, ptr0, len0);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return WasmResultIter.__wrap(ret[0]);
  }
  /**
   * @param {string} sql
   */
  execute(sql) {
    const ptr0 = passStringToWasm0(sql, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.wasmdatabase_execute(this.__wbg_ptr, ptr0, len0);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
}
if (Symbol.dispose) WasmDatabase.prototype[Symbol.dispose] = WasmDatabase.prototype.free;
placeholder.WasmDatabase = WasmDatabase;

class WasmResultIter {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(WasmResultIter.prototype);
    obj.__wbg_ptr = ptr;
    WasmResultIterFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WasmResultIterFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_wasmresultiter_free(ptr, 0);
    }
    /**
     * Returns the next row as a JS object, or `undefined` when done.
     * @returns {any}
     */
    next() {
      const ret = wasm.wasmresultiter_next(this.__wbg_ptr);
      if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
      }
      return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Returns the output schema as an array of `{ name, datatype, nullable }`.
     * @returns {any}
     */
    schema() {
      const ret = wasm.wasmresultiter_schema(this.__wbg_ptr);
      if (ret[2]) {
        throw takeFromExternrefTable0(ret[1]);
      }
      return takeFromExternrefTable0(ret[0]);
    }
    /**
     * Collect all remaining rows into an array and finish the iterator.
     * @returns {any}
     */
    rows() {
    const ret = wasm.wasmresultiter_rows(this.__wbg_ptr);
    if (ret[2]) {
      throw takeFromExternrefTable0(ret[1]);
    }
    return takeFromExternrefTable0(ret[0]);
  }
  /**
   * Finish iteration early and commit any work.
   */
  finish() {
    const ret = wasm.wasmresultiter_finish(this.__wbg_ptr);
    if (ret[1]) {
      throw takeFromExternrefTable0(ret[0]);
    }
  }
}
if (Symbol.dispose) WasmResultIter.prototype[Symbol.dispose] = WasmResultIter.prototype.free;
placeholder.WasmResultIter = WasmResultIter;

placeholder.__wbg_Error_52673b7de5a0ca89 = function(arg0, arg1) {
  const ret = Error(getStringFromWasm0(arg0, arg1));
  return ret;
};

placeholder.__wbg_String_8f0eb39a4a4c2f66 = function(arg0, arg1) {
  const ret = String(arg1);
  const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc_command_export, wasm.__wbindgen_realloc_command_export);
  const len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
};

placeholder.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
};

placeholder.__wbg_getRandomValues_3c9c0d586e575a16 = function() { return handleError(function(arg0, arg1) {
  globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
}, arguments); };

placeholder.__wbg_getTime_ad1e9878a735af08 = function(arg0) {
  const ret = arg0.getTime();
  return ret;
};

placeholder.__wbg_getTimezoneOffset_45389e26d6f46823 = function(arg0) {
  const ret = arg0.getTimezoneOffset();
  return ret;
};

placeholder.__wbg_new_0_23cedd11d9b40c9d = function() {
  const ret = new Date();
  return ret;
};

placeholder.__wbg_new_1ba21ce319a06297 = function() {
  const ret = new Object();
  return ret;
};

placeholder.__wbg_new_25f239778d6112b9 = function() {
  const ret = new Array();
  return ret;
};

placeholder.__wbg_new_b2db8aa2650f793a = function(arg0) {
  const ret = new Date(arg0);
  return ret;
};

placeholder.__wbg_new_df1173567d5ff028 = function(arg0, arg1) {
  const ret = new Error(getStringFromWasm0(arg0, arg1));
  return ret;
};

placeholder.__wbg_now_69d776cd24f5215b = function() {
  const ret = Date.now();
  return ret;
};

placeholder.__wbg_set_3f1d0b984ed272ed = function(arg0, arg1, arg2) {
  arg0[arg1] = arg2;
};

placeholder.__wbg_set_7df433eea03a5c14 = function(arg0, arg1, arg2) {
  arg0[arg1 >>> 0] = arg2;
};

placeholder.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
  // Cast intrinsic for `Ref(String) -> Externref`.
  const ret = getStringFromWasm0(arg0, arg1);
  return ret;
};

placeholder.__wbindgen_cast_4625c577ab2ec9ee = function(arg0) {
  // Cast intrinsic for `U64 -> Externref`.
  const ret = BigInt.asUintN(64, arg0);
  return ret;
};

placeholder.__wbindgen_cast_9ae0607507abb057 = function(arg0) {
  // Cast intrinsic for `I64 -> Externref`.
  const ret = arg0;
  return ret;
};

placeholder.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
  // Cast intrinsic for `F64 -> Externref`.
  const ret = arg0;
  return ret;
};

placeholder.__wbindgen_init_externref_table = function() {
  const table = wasm.__wbindgen_externrefs;
  const offset = table.grow(4);
  table.set(0, undefined);
  table.set(offset + 0, undefined);
  table.set(offset + 1, null);
  table.set(offset + 2, true);
  table.set(offset + 3, false);
};

async function init(input = wasmUrl) {
  if (wasm) return wasm;

  const response = typeof input === "string" || input instanceof URL ? fetch(input) : input;
  const { instance, module } = await (async () => {
    const res = await response;
    if (res instanceof Response) {
      const resForStreaming = res.clone();
      if (typeof WebAssembly.instantiateStreaming === "function") {
        try {
          return await WebAssembly.instantiateStreaming(resForStreaming, imports);
        } catch (e) {
          // Fallback if incorrect MIME type.
          const bytes = await res.arrayBuffer();
          return await WebAssembly.instantiate(bytes, imports);
        }
      }
      const bytes = await res.arrayBuffer();
      return await WebAssembly.instantiate(bytes, imports);
    }
    return await WebAssembly.instantiate(res, imports);
  })();

  wasm = instance.exports;
  placeholder.__wasm = wasm;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start?.();
  return wasm;
}

export { WasmDatabase, WasmResultIter };
export default init;
