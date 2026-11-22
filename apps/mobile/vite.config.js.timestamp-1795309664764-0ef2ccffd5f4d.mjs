// vite.config.js
import legacy from "file:///home/cassi/.t3/worktrees/game-node-clients/t3-6224b162-bb20f1578f0c6a2e/node_modules/.pnpm/@vitejs+plugin-legacy@7.2.1_terser@5.39.0_vite@7.1.10_@types+node@20.12.5_jiti@1.21.7_s_d78cf687eb1f77236c8756cd1bb2868b/node_modules/@vitejs/plugin-legacy/dist/index.js";
import react from "file:///home/cassi/.t3/worktrees/game-node-clients/t3-6224b162-bb20f1578f0c6a2e/node_modules/.pnpm/@vitejs+plugin-react@5.0.4_vite@7.1.10_@types+node@20.12.5_jiti@1.21.7_sugarss@5.0.1_po_1911d4312d69167eca464cdfbcf02313/node_modules/@vitejs/plugin-react/dist/index.js";
import { defineConfig } from "file:///home/cassi/.t3/worktrees/game-node-clients/t3-6224b162-bb20f1578f0c6a2e/node_modules/.pnpm/vite@7.1.10_@types+node@20.12.5_jiti@1.21.7_sugarss@5.0.1_postcss@8.5.6__terser@5.39.0_tsx@4.23.15_yaml@2.8.1/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///home/cassi/.t3/worktrees/game-node-clients/t3-6224b162-bb20f1578f0c6a2e/node_modules/.pnpm/vite-tsconfig-paths@5.1.4_typescript@5.9.2_vite@7.1.10_@types+node@20.12.5_jiti@1.21.7__81aaef2240fdd9747f9491c47786199d/node_modules/vite-tsconfig-paths/dist/index.js";
import { createRequire } from "node:module";
var __vite_injected_original_import_meta_url = "file:///home/cassi/.t3/worktrees/game-node-clients/t3-6224b162-bb20f1578f0c6a2e/apps/mobile/vite.config.js";
var { nativeFingerprint } = createRequire(__vite_injected_original_import_meta_url)(
  "../../scripts/native-fingerprint.cjs"
);
var vite_config_default = defineConfig({
  define: {
    __NATIVE_FINGERPRINT__: JSON.stringify(nativeFingerprint())
  },
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"]
      }
    }),
    legacy(),
    tsconfigPaths()
  ],
  css: {
    postcss: "./postcss.config.js"
  },
  resolve: {
    // packages/ui does not declare react, so it could resolve a second copy
    // from the workspace root. Two Reacts break the React Compiler runtime
    // (`useMemoCache` of null -> blank screen).
    dedupe: ["react", "react-dom"],
    alias: {
      // /esm/icons/index.mjs only exports the icons statically, so no separate chunks are created
      // This solves this nasty bug: https://github.com/tabler/tabler-icons/issues/1233
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs"
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9jYXNzaS8udDMvd29ya3RyZWVzL2dhbWUtbm9kZS1jbGllbnRzL3QzLTYyMjRiMTYyLWJiMjBmMTU3OGYwYzZhMmUvYXBwcy9tb2JpbGVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2Nhc3NpLy50My93b3JrdHJlZXMvZ2FtZS1ub2RlLWNsaWVudHMvdDMtNjIyNGIxNjItYmIyMGYxNTc4ZjBjNmEyZS9hcHBzL21vYmlsZS92aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9jYXNzaS8udDMvd29ya3RyZWVzL2dhbWUtbm9kZS1jbGllbnRzL3QzLTYyMjRiMTYyLWJiMjBmMTU3OGYwYzZhMmUvYXBwcy9tb2JpbGUvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgbGVnYWN5IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1sZWdhY3lcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xuaW1wb3J0IHsgY3JlYXRlUmVxdWlyZSB9IGZyb20gXCJub2RlOm1vZHVsZVwiO1xuXG5jb25zdCB7IG5hdGl2ZUZpbmdlcnByaW50IH0gPSBjcmVhdGVSZXF1aXJlKGltcG9ydC5tZXRhLnVybCkoXG4gIFwiLi4vLi4vc2NyaXB0cy9uYXRpdmUtZmluZ2VycHJpbnQuY2pzXCIsXG4pO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuLyoqIEB0eXBlIHtpbXBvcnQoJ3ZpdGUnKS5Vc2VyQ29uZmlnfSAqL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgZGVmaW5lOiB7XG4gICAgX19OQVRJVkVfRklOR0VSUFJJTlRfXzogSlNPTi5zdHJpbmdpZnkobmF0aXZlRmluZ2VycHJpbnQoKSksXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCh7XG4gICAgICBiYWJlbDoge1xuICAgICAgICBwbHVnaW5zOiBbXCJiYWJlbC1wbHVnaW4tcmVhY3QtY29tcGlsZXJcIl0sXG4gICAgICB9LFxuICAgIH0pLFxuICAgIGxlZ2FjeSgpLFxuICAgIHRzY29uZmlnUGF0aHMoKSxcbiAgXSxcbiAgY3NzOiB7XG4gICAgcG9zdGNzczogXCIuL3Bvc3Rjc3MuY29uZmlnLmpzXCIsXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICAvLyBwYWNrYWdlcy91aSBkb2VzIG5vdCBkZWNsYXJlIHJlYWN0LCBzbyBpdCBjb3VsZCByZXNvbHZlIGEgc2Vjb25kIGNvcHlcbiAgICAvLyBmcm9tIHRoZSB3b3Jrc3BhY2Ugcm9vdC4gVHdvIFJlYWN0cyBicmVhayB0aGUgUmVhY3QgQ29tcGlsZXIgcnVudGltZVxuICAgIC8vIChgdXNlTWVtb0NhY2hlYCBvZiBudWxsIC0+IGJsYW5rIHNjcmVlbikuXG4gICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSxcbiAgICBhbGlhczoge1xuICAgICAgLy8gL2VzbS9pY29ucy9pbmRleC5tanMgb25seSBleHBvcnRzIHRoZSBpY29ucyBzdGF0aWNhbGx5LCBzbyBubyBzZXBhcmF0ZSBjaHVua3MgYXJlIGNyZWF0ZWRcbiAgICAgIC8vIFRoaXMgc29sdmVzIHRoaXMgbmFzdHkgYnVnOiBodHRwczovL2dpdGh1Yi5jb20vdGFibGVyL3RhYmxlci1pY29ucy9pc3N1ZXMvMTIzM1xuICAgICAgXCJAdGFibGVyL2ljb25zLXJlYWN0XCI6IFwiQHRhYmxlci9pY29ucy1yZWFjdC9kaXN0L2VzbS9pY29ucy9pbmRleC5tanNcIixcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThhLE9BQU8sWUFBWTtBQUNqYyxPQUFPLFdBQVc7QUFDbEIsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyxxQkFBcUI7QUFKa1AsSUFBTSwyQ0FBMkM7QUFNalUsSUFBTSxFQUFFLGtCQUFrQixJQUFJLGNBQWMsd0NBQWU7QUFBQSxFQUN6RDtBQUNGO0FBSUEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sd0JBQXdCLEtBQUssVUFBVSxrQkFBa0IsQ0FBQztBQUFBLEVBQzVEO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixPQUFPO0FBQUEsUUFDTCxTQUFTLENBQUMsNkJBQTZCO0FBQUEsTUFDekM7QUFBQSxJQUNGLENBQUM7QUFBQSxJQUNELE9BQU87QUFBQSxJQUNQLGNBQWM7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsS0FBSztBQUFBLElBQ0gsU0FBUztBQUFBLEVBQ1g7QUFBQSxFQUNBLFNBQVM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlQLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFBQSxJQUM3QixPQUFPO0FBQUE7QUFBQTtBQUFBLE1BR0wsdUJBQXVCO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
