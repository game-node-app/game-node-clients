import { createTheme, DEFAULT_THEME, mergeMantineTheme } from "@mantine/core";

const themeOverride = createTheme({
  fontFamily: "Roboto, Roboto Fallback",
  colors: {
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
  primaryColor: "brand",
});

console.log(DEFAULT_THEME);

export const DEFAULT_MANTINE_THEME = mergeMantineTheme(
  DEFAULT_THEME,
  themeOverride,
);
