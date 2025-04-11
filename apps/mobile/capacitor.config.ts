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
      backgroundColor: "#161616",
      style: "DARK",
    },
    EdgeToEdge: {
      // Should be the same as StatusBar#backgroundColor!
      backgroundColor: "#161616",
    },
  },
  android: {
    // Already done by @capawesome/capacitor-android-edge-to-edge-support
    // Do not enable here
    adjustMarginsForEdgeToEdge: "disable",
  },
};

export default config;
