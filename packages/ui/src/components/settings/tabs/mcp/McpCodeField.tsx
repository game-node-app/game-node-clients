import { Box, Group, Stack, Text } from "@mantine/core";
import { McpCopyButton } from "#@/components/settings/tabs/mcp/McpCopyButton";
import { cn } from "#@/util";

interface Props {
  value: string;
  /** Small caption above the field (e.g. which file the snippet goes in). */
  label?: string;
  className?: string;
}

/** Monospace, selectable value with a "Copy" button (Figma "Campo mono + Copiar"). */
export function McpCodeField({ value, label, className }: Props) {
  return (
    <Stack gap={6} className={cn("w-full min-w-0", className)}>
      {label && (
        <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
          {label}
        </Text>
      )}
      <Group
        wrap={"nowrap"}
        align={"flex-start"}
        gap={12}
        className={
          "w-full rounded-lg border border-solid border-[#2a2a2a] bg-[#0b0b0b] py-1.5 pe-1.5 ps-3.5"
        }
      >
        <Box
          component={"pre"}
          className={
            "m-0 min-w-0 flex-1 select-text overflow-x-auto whitespace-pre py-[7px] font-mono text-[13px] leading-[17px] text-white"
          }
        >
          {value}
        </Box>
        <McpCopyButton value={value} />
      </Group>
    </Stack>
  );
}
