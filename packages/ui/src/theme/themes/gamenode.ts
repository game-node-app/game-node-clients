import { defineTheme } from "../defineTheme";

/**
 * GameNode's default (and only) theme during the foundation phase.
 *
 * Every value below is pinned to what the apps rendered before the token
 * system: Mantine brand/secondary/tertiary/dark, the Tailwind palettes and the
 * Ionic colors in `apps/mobile/src/theme/variables.css`. Do not "simplify"
 * these values; they are the `gamenode` parity baseline.
 */
export const gamenodeTheme = defineTheme({
  id: "gamenode",
  labelKey: "settings.appearance.theme.dark",
  colorScheme: "dark",
  tokens: {
    background: "#111111",
    surface: "#161616",
    text: "#FFFFFF",
    textMuted: "#828282",
    border: "#2A2A2A",
    accent: "#F15025",
    accentContrast: "#000000",
    focus: "#FFFFFF",
    success: "#0C9D61",
    warning: "#FE9B0E",
    danger: "#EC2D30",
  },
  radius: "0.5rem",
  font: "Roboto, Roboto Fallback",
  overrides: {
    brand: {
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
    paper: {
      0: "#161616",
      1: "#262525",
      2: "#1D1D1D",
      3: "#191919",
      4: "#242424",
      5: "#1C1C1C",
      6: "#212121",
      7: "#111111",
      8: "#1A1A1A",
    },
    dark: {
      0: "#C9C9C9",
      1: "#b8b8b8",
      2: "#828282",
      3: "#696969",
      4: "#424242",
      5: "#3b3b3b",
      6: "#2e2e2e",
      7: "#242424",
      8: "#1f1f1f",
      9: "#141414",
    },
    secondary: "#1A1A1A",
    tertiary: "#872C13",
    brandTint: "#2e150f",
    line: {
      default: "#2A2A2A",
      strong: "#3D3D3D",
    },
    dimmed: {
      default: "#828282",
      1: "#808080",
      2: "#ADADAD",
      3: "#7A7A7A",
    },
    premium: {
      base: "#9747FF",
      text: "#C7A6FF",
      soft: "#B98AFF",
      bright: "#E4D5FF",
    },
    chart: {
      primary: "#DD6747",
    },
    level: {
      text: "#AAA5A5",
      border: "#9A9A9A",
    },
    status: {
      successText: "#3DD68C",
      warningText: "#F5A524",
      dangerStrong: "#E5484D",
      dangerText: "#FF6369",
    },
    nav: {
      canvas: "#0B0B0B",
      surface: "#111111",
      raised: "#222222",
      border: "#2A2A2A",
      text: "#FFFFFF",
      muted: "#ADADAD",
      danger: "#DDA4A4",
      accentSubtle: "rgba(241, 80, 37, 0.12)",
    },
    textColor: "#D9D9D9",
    textEmphasis: "#E3E3E3",
    accentText: "#FF8A66",
    scrim: "#000000",
    mobile: {
      buttonBorder: "#373737",
      tabText: "#FAF4F4",
      menuCanvas: "#0F0F0F",
      menuDanger: "#F87171",
      splashBackground: "#1A1A1A",
      systemBarBackground: "#1F1F1F",
    },
    state: {
      played: "#4fd1a5",
      playedTint: "#0f2620",
    },
    mantine: {
      fontFamily: "Roboto, Roboto Fallback",
      fontFamilyHeadings:
        "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
      body: "#111111",
      text: "#FFFFFF",
      dimmed: "#828282",
      radius: "0.5rem",
    },
    ionic: {
      colors: {
        primary: {
          base: "#F15025",
          contrast: "#000000",
          shade: "#d44621",
          tint: "#f2623b",
        },
        secondary: {
          base: "#F47351",
          contrast: "#000000",
          shade: "#d76547",
          tint: "#f58162",
        },
        tertiary: {
          base: "#9747FF",
          contrast: "#000000",
          shade: "#853ee0",
          tint: "#a159ff",
        },
        success: {
          base: "#0C9D61",
          contrast: "#000000",
          shade: "#0b8a55",
          tint: "#24a771",
        },
        warning: {
          base: "#FE9B0E",
          contrast: "#000000",
          shade: "#e0880c",
          tint: "#fea526",
        },
        danger: {
          base: "#EC2D30",
          contrast: "#000000",
          shade: "#d0282a",
          tint: "#ee4245",
        },
        light: {
          base: "#f6f8fc",
          contrast: "#000000",
          shade: "#d8dade",
          tint: "#f7f9fc",
        },
        medium: {
          base: "#1D1D1D",
          contrast: "#ffffff",
          shade: "#1a1a1a",
          tint: "#343434",
        },
        dark: {
          base: "#191919",
          contrast: "#ffffff",
          shade: "#161616",
          tint: "#303030",
        },
      },
      surfaces: {
        background: "#111111",
        text: "#FFFFFF",
        toolbarBackground: "#111111",
        tabBarBackground: "#161616",
        itemBackground: "#1e1e1e",
        cardBackground: "#1e1e1e",
        modalBackground: "#111111",
      },
    },
  },
});
