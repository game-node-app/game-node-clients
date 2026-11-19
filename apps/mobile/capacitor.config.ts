import "dotenv/config";
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.gamenode",
  appName: "GameNode",
  webDir: "dist",
  // Same colour as the launch splash: avoids a white flash while the WebView loads.
  backgroundColor: "#1A1A1A",
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
    // Native HTTP has no CORS, so API calls skip the preflight round trip from the WebView origin.
    CapacitorHttp: {
      enabled: true,
    },
    StatusBar: {
      backgroundColor: "#111111",
      style: "DARK",
    },
    EdgeToEdge: {
      // Should be the same as StatusBar#backgroundColor!
      backgroundColor: "#111111",
    },
    SystemBars: {
      style: "DARK",
      // Insets are handled by @capawesome/capacitor-android-edge-to-edge-support.
      insetsHandling: "disable",
    },
  },
};

export default config;
