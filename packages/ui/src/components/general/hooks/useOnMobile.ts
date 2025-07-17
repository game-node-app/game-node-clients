import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { useMantineTheme } from "@mantine/core";

/**
 * Checks if the user is on a mobile device, using media queries.
 * WARNING: On by default (for SSR).
 */
export function useOnMobile() {
  const theme = useMantineTheme();
  const value = useMediaQuery(
    `(max-width: ${theme.breakpoints.sm})`,
    true,
  ) as boolean;
  // Avoids max-depth-reached when changing breakpoints
  const [debounced] = useDebouncedValue(value, 500);
  return debounced;
}
