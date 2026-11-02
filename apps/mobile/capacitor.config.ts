import "dotenv/config";
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.gamenode",
  appName: "GameNode",
  webDir: "dist",
  plugins: {
    LiveUpdate: {
      readyTimeout: 10000,
      autoDeleteBundles: true,
    },
    Keyboard: {
      resizeOnFullScreen: false, // Prevents bad resizing
    },
    CapacitorCookies: {
      enabled: true,
    },
    StatusBar: {
      backgroundColor: "#1f1f1f",
      style: "DARK",
    },
    EdgeToEdge: {
      // Should be the same as StatusBar#backgroundColor!
      backgroundColor: "#1f1f1f",
    },
    SystemBars: {
      style: "DARK",
      // Insets are handled by @capawesome/capacitor-android-edge-to-edge-support.
      insetsHandling: "disable",
    },
  },
};

export default config;
