import type { Config } from "tailwindcss";
import prose from "@tailwindcss/typography";

// We want each package to be responsible for its own content.
const config: Omit<Config, "content"> = {
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      backgroundColor: {
        mobile: "#191919",
        desktop: "#191919",
      },
      fontFamily: "var(--mantine-font-family)",
      spacing: {
        xs: "var(--mantine-spacing-xs)",
        sm: "var(--mantine-spacing-sm)",
        md: "var(--mantine-spacing-md)",
        lg: "var(--mantine-spacing-lg)",
        xl: "var(--mantine-spacing-xl)",
      },
      borderRadius: {
        xs: "var(--mantine-radius-xs)",
        sm: "var(--mantine-radius-sm)",
        md: "var(--mantine-radius-md)",
        lg: "var(--mantine-radius-lg)",
        xl: "var(--mantine-radius-xl)",
      },
      screens: {
        xs: "30em",
        sm: "48em",
        md: "64em",
        lg: "74em",
        xl: "90em",
      },
      fontSize: {
        xs: "var(--mantine-font-size-xs)",
        sm: "var(--mantine-font-size-sm)",
        md: "var(--mantine-font-size-md)",
        lg: "var(--mantine-font-size-lg)",
        xl: "var(--mantine-font-size-xl)",
      },
      colors: {
        dimmed: "var(--mantine-color-dimmed)",
        paper: "#161616",
        "paper-alt": "#262525",

        brand: [
          "#ffede5",
          "#ffd9cf",
          "#fbb3a0",
          "#f7896d",
          "#f36742",
          "#f15025",
          "#f14517",
          "#d6360b",
          "#c02d06",
          "#a82301",
        ],
      },
    },
  },
  plugins: [prose()],
};
export default config;
