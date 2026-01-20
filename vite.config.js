import { defineConfig } from "vite";

export default defineConfig({
  base: "/pour-haus-concrete/",
  root: ".",
  publicDir: "public",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    minify: "esbuild",
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true,
  },
});
