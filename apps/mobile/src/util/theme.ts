import { createTheme, DEFAULT_THEME, mergeMantineTheme } from "@mantine/core";

const themeOverride = createTheme({
    fontFamily: "Inter",
    colors: {
        brand: [
            "#ffede5",
            "#ffd9cf",
            "#fbb3a0",
            "#f7896d",
            "#f36742",
            "#f15126",
            "#f14517",
            "#d6360b",
            "#c02d06",
            "#a82301",
        ],
    },
    primaryColor: "brand",
});
export const theme = mergeMantineTheme(DEFAULT_THEME, themeOverride);
