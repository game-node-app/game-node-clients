import { useMediaQuery } from "@mantine/hooks";
import { useMantineTheme } from "@mantine/core";

/**
 * Checks if the user is on a mobile device, using media queries.
 * WARNING: On by default (for SSR).
 */
export default function useOnMobile() {
    const theme = useMantineTheme();
    return useMediaQuery(
        `(max-width: ${theme.breakpoints.sm})`,
        true,
    ) as boolean;
}
