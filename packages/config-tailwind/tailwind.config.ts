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
      fontFamily: "var(--mantine-font-family)",
      spacing: {
        xs: "var(--mantine-spacing-xs)",
        sm: "var(--mantine-spacing-sm)",
        md: "var(--mantine-spacing-md)",
        lg: "var(--mantine-spacing-lg)",
        xl: "var(--mantine-spacing-xl)",
      },
      inset: {
        "sticky-safe":
          "calc(var(--ion-safe-area-top, 56px) - var(--padding-top, 0px))",
      },
      borderRadius: {
        xs: "var(--mantine-radius-xs)",
        sm: "var(--mantine-radius-sm)",
        md: "var(--mantine-radius-md)",
        lg: "var(--mantine-radius-lg)",
        xl: "var(--mantine-radius-xl)",
      },
      screens: {
        xs: "36em",
        sm: "48em",
        md: "62em",
        lg: "75em",
        xl: "88em",
      },
      fontSize: {
        xs: "var(--mantine-font-size-xs)",
        sm: "var(--mantine-font-size-sm)",
        md: "var(--mantine-font-size-md)",
        lg: "var(--mantine-font-size-lg)",
        xl: "var(--mantine-font-size-xl)",
      },
      textColor: "var(--gn-text)",
      colors: {
        body: "var(--mantine-color-body)",
        // Values live in @repo/ui themes.css so each app theme can swap them.
        paper: {
          DEFAULT: "var(--gn-paper-0)",
          0: "var(--gn-paper-0)",
          1: "var(--gn-paper-1)",
          2: "var(--gn-paper-2)",
          3: "var(--gn-paper-3)",
          4: "var(--gn-paper-4)",
          5: "var(--gn-paper-5)",
          6: "var(--gn-paper-6)",
          7: "var(--gn-paper-7)",
          8: "var(--gn-paper-8)",
        },
        dimmed: {
          DEFAULT: "var(--mantine-color-dimmed)",
          0: "var(--mantine-color-dimmed)",
          1: "var(--gn-dimmed)",
        },
        brand: {
          DEFAULT: "var(--gn-brand)",
          0: "var(--gn-brand-0)",
          1: "var(--gn-brand-1)",
          2: "var(--gn-brand-2)",
          3: "var(--gn-brand-3)",
          4: "var(--gn-brand-4)",
          5: "var(--gn-brand)",
          6: "var(--gn-brand-6)",
          7: "var(--gn-brand-7)",
          8: "var(--gn-brand-8)",
          9: "var(--gn-brand-9)",
        },
        border: "var(--gn-border)",
        secondary: "var(--gn-secondary)",
        tertiary: "var(--gn-tertiary)",
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
