import "dotenv/config";
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.gamenode",
  appName: "GameNode",
  webDir: "dist",
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: "rgba(0,0,0,0)",
      style: "DARK",
    },
    EdgeToEdge: {
      // Should be the same as StatusBar#backgroundColor!
      backgroundColor: "rgba(0,0,0,0)",
    },
  },
  android: {
    // Already done by @capawesome/capacitor-android-edge-to-edge-support
    // Do not enable here
    adjustMarginsForEdgeToEdge: "disable",
  },
};

export default config;
