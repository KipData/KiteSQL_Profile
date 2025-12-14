import { defineConfig } from "vite";

// Vite will handle the wasm import from the bundler-target build of kite_sql.
export default defineConfig({
  publicDir: "static",
  server: {
    port: 4173,
  },
});
