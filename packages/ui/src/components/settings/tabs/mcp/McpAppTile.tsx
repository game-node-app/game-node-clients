import { Box, Text } from "@mantine/core";
import { cn } from "#@/util";

interface Props {
  name: string;
  size?: 36 | 40;
  className?: string;
}

/** Rounded square with the app's initial (connected apps and revoke dialog). */
export function McpAppTile({ name, size = 36, className }: Props) {
  return (
    <Box
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[10px] bg-nav-raised",
        size === 40 ? "size-10" : "size-9",
        className,
      )}
    >
      <Text fz={16} fw={600} c="var(--gn-text)" lh={"normal"}>
        {name.trim().charAt(0).toUpperCase() || "?"}
      </Text>
    </Box>
  );
}
