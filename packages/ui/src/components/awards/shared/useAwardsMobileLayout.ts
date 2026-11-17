import { useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";

/**
 * True below Mantine's `md` breakpoint, where the Awards screens follow the
 * mobile frames (one category at a time, bottom vote bar, compact cards).
 * Defaults to the desktop layout on the server.
 */
export function useAwardsMobileLayout(): boolean {
  const theme = useMantineTheme();

  return useMediaQuery(
    `(max-width: ${theme.breakpoints.md})`,
    false,
  ) as boolean;
}
