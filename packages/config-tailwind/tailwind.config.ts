import type { Config } from "tailwindcss";
import prose from "@tailwindcss/typography";
import containerQueries from "@tailwindcss/container-queries";
import plugin from "tailwindcss/plugin";

function themeColor(token: string) {
  const color = `var(--gn-${token})`;

  return ({ opacityValue = 1 }: { opacityValue?: string | number } = {}) => {
    const opacity = String(opacityValue);
    if (opacity === "1") return color;

    const weight = opacity.endsWith("%") ? opacity : `calc(${opacity} * 100%)`;
    return `color-mix(in srgb, ${color} ${weight}, transparent)`;
  };
}

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
      keyframes: {
        "gn-fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "gn-fade-up": {
          from: { opacity: "0", transform: "translateY(12px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: {
        "gn-fade-in": "gn-fade-in 300ms ease-out both",
        "gn-fade-up": "gn-fade-up 450ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      textColor: themeColor("text-color"),
      colors: {
        body: themeColor("body"),
        // Every value below lives in @repo/ui/themes.css so a theme can swap it.
        paper: {
          DEFAULT: themeColor("paper-0"),
          0: themeColor("paper-0"),
          1: themeColor("paper-1"),
          2: themeColor("paper-2"),
          3: themeColor("paper-3"),
          4: themeColor("paper-4"),
          5: themeColor("paper-5"),
          6: themeColor("paper-6"),
          7: themeColor("paper-7"),
          8: themeColor("paper-8"),
        },
        surface: {
          DEFAULT: themeColor("surface"),
          0: themeColor("paper-0"),
          1: themeColor("paper-1"),
          2: themeColor("paper-2"),
          3: themeColor("paper-3"),
          4: themeColor("paper-4"),
          5: themeColor("paper-5"),
          6: themeColor("paper-6"),
          7: themeColor("paper-7"),
          8: themeColor("paper-8"),
        },
        line: {
          DEFAULT: themeColor("line"),
          strong: themeColor("line-strong"),
        },
        dimmed: {
          DEFAULT: themeColor("dimmed"),
          0: themeColor("dimmed"),
          1: themeColor("dimmed-1"),
          2: themeColor("dimmed-2"),
          3: themeColor("dimmed-3"),
        },
        "text-muted": themeColor("text-muted"),
        muted: themeColor("text-muted"),
        emphasis: themeColor("text-emphasis"),
        accent: themeColor("accent"),
        "accent-contrast": themeColor("accent-contrast"),
        focus: themeColor("focus"),
        premium: {
          DEFAULT: themeColor("premium"),
          text: themeColor("premium-text"),
          soft: themeColor("premium-soft"),
          bright: themeColor("premium-bright"),
        },
        chart: {
          primary: themeColor("chart-primary"),
        },
        level: {
          text: themeColor("level-text"),
          border: themeColor("level-border"),
        },
        "status-success-text": themeColor("status-success-text"),
        "status-warning-text": themeColor("status-warning-text"),
        "status-danger-strong": themeColor("status-danger-strong"),
        "status-danger-text": themeColor("status-danger-text"),
        brand: {
          DEFAULT: themeColor("brand"),
          0: themeColor("brand-0"),
          1: themeColor("brand-1"),
          2: themeColor("brand-2"),
          3: themeColor("brand-3"),
          4: themeColor("brand-4"),
          5: themeColor("brand-5"),
          6: themeColor("brand-6"),
          7: themeColor("brand-7"),
          8: themeColor("brand-8"),
          9: themeColor("brand-9"),
          // Selected/"your vote" surface of the Awards (design `brand/tint`).
          tint: themeColor("brand-tint"),
        },
        // Play-status colors of the Awards chips and notes.
        state: {
          played: themeColor("state-played"),
          "played-tint": themeColor("state-played-tint"),
        },
        secondary: themeColor("secondary"),
        tertiary: themeColor("tertiary"),
        nav: {
          canvas: themeColor("nav-canvas"),
          surface: themeColor("nav-surface"),
          raised: themeColor("nav-raised"),
          border: themeColor("nav-border"),
          text: themeColor("nav-text"),
          muted: themeColor("nav-muted"),
          danger: themeColor("nav-danger"),
          "accent-subtle": themeColor("nav-accent-subtle"),
        },
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
