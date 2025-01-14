/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), legacy(), tsconfigPaths()],
    resolve: {
        alias: {
            // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
            // This solves this nasty bug: https://github.com/tabler/tabler-icons/issues/1233
            "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
        },
    },
});
