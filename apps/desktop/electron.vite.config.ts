import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const server = new URL(
    env.VITE_PUBLIC_SERVER_URL || "https://server.gamenode.app",
  );
  const search = new URL(
    env.VITE_PUBLIC_SEARCH_URL || "https://search.gamenode.app",
  );
  return {
    main: {
      define: {
        "process.env.GAMENODE_SERVER_URL": JSON.stringify(server.href),
      },
    },
    preload: {
      build: {
        rollupOptions: {
          output: { format: "cjs", entryFileNames: "index.js" },
        },
      },
    },
    renderer: {
      plugins: [
        react(),
        {
          name: "desktop-csp",
          transformIndexHtml(html) {
            return html
              .replace(
                "__SCRIPT_SRC__",
                mode === "development" ? "'unsafe-inline'" : "",
              )
              .replace(
                "__CONNECT_SRC__",
                [
                  server.origin,
                  search.origin,
                  ...(mode === "development"
                    ? ["ws://localhost:*", "http://localhost:*"]
                    : []),
                ].join(" "),
              );
          },
        },
      ],
    },
  };
});
