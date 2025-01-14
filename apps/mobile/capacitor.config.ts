import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
    appId: "app.gamenode",
    appName: "GameNode",
    webDir: "dist",
    plugins: {
        CapacitorCookies: {
            enabled: true,
        },
    },
};

export default config;
