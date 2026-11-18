import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { createRequire } from "node:module";

const { nativeFingerprint } = createRequire(import.meta.url)(
  "../../scripts/native-fingerprint.cjs",
);

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  define: {
    __NATIVE_FINGERPRINT__: JSON.stringify(nativeFingerprint()),
  },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    legacy(),
    tsconfigPaths(),
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  resolve: {
    // packages/ui does not declare react, so it could resolve a second copy
    // from the workspace root. Two Reacts break the React Compiler runtime
    // (`useMemoCache` of null -> blank screen).
    dedupe: ["react", "react-dom"],
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      // This solves this nasty bug: https://github.com/tabler/tabler-icons/issues/1233
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
});
