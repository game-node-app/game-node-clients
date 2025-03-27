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
  },
};

export default config;
