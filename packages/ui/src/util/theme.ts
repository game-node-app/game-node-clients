import {
  colorsTuple,
  createTheme,
  DEFAULT_THEME,
  mergeMantineTheme,
} from "@mantine/core";

const themeOverride = createTheme({
  fontFamily: "Roboto, Roboto Fallback",
  colors: {
    brand: colorsTuple("#F15025"),
    secondary: colorsTuple("#1A1A1A"),
    tertiary: colorsTuple("#872C13"),
  },
  primaryColor: "brand",
});

export const DEFAULT_MANTINE_THEME = mergeMantineTheme(
  DEFAULT_THEME,
  themeOverride,
);
