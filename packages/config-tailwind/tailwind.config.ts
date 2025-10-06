import type { Config } from "tailwindcss";
import prose from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import plugin from "tailwindcss/plugin";

// We want each package to be responsible for its own content.
const config: Omit<Config, "content"> = {
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      backgroundColor: {
        body: "var(--mantine-color-body)",
        paper: {
          DEFAULT: "#161616",
          0: "#161616",
          1: "#262525",
          2: "#1D1D1D",
          3: "#191919",
        },
      },
      fontFamily: "var(--mantine-font-family)",
      spacing: {
        xs: "var(--mantine-spacing-xs)",
        sm: "var(--mantine-spacing-sm)",
        md: "var(--mantine-spacing-md)",
        lg: "var(--mantine-spacing-lg)",
        xl: "var(--mantine-spacing-xl)",
      },
      inset: {
        "sticky-safe": "calc(var(--ion-safe-area-top, 56px))",
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
      textColor: "#D9D9D9",
      colors: {
        dimmed: {
          DEFAULT: "var(--mantine-color-dimmed)",
          0: "var(--mantine-color-dimmed)",
          1: "#808080",
        },
        brand: {
          DEFAULT: "#f15025",
          0: "#ffede5",
          1: "#ffd9cf",
          2: "#fbb3a0",
          3: "#f7896d",
          4: "#f36742",
          5: "#f15025",
          6: "#f14517",
          7: "#d6360b",
          8: "#c02d06",
          9: "#a82301",
        },
        secondary: "#1A1A1A",
        tertiary: "#872C13",
      },
    },
  },
  plugins: [
    prose(),
    containerQueries,
    plugin(({ addVariant }) => {
      // Add custom conditional variants that are applied based on the root element's
      // classname.
      addVariant("mobile", ":is(.app-mobile &)");
      addVariant("web", ":is(.app-web &)");
      addVariant("admin", ":is(.app-admin &)");
    }),
  ],
};
export default config;
