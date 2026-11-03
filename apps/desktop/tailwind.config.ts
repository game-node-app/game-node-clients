import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Config = {
  content: [
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [sharedConfig],
  // Figma Design System error color; no equivalent in the shared preset.
  theme: { extend: { colors: { danger: "#E5484D" } } },
};

export default config;
