import { defineConfig } from "vite";

// Vite will handle the wasm import from the bundler-target build of kite_sql.
export default defineConfig({
  // GitHub Pages site will be served from /KiteSQL_Profile/
  base: "/KiteSQL_Profile/",
  publicDir: "static",
  server: {
    port: 4173,
  },
});
