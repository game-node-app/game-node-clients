import { Box, Group, Stack, Text } from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { ComponentType, ReactNode } from "react";
import { cn } from "#@/util";

interface SettingsIconTileProps {
  Icon: ComponentType<IconProps>;
  className?: string;
  iconClassName?: string;
}

/** 36px rounded square holding a row icon (Figma "Tile"). */
export function SettingsIconTile({
  Icon,
  className,
  iconClassName,
}: SettingsIconTileProps) {
  return (
    <Box
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[#222]",
        className,
      )}
    >
      <Icon size={18} className={cn("text-[#d9d9d9]", iconClassName)} />
    </Box>
  );
}

interface Props {
  title: ReactNode;
  description?: ReactNode;
  /** Icon drawn in a tile on the left. */
  Icon?: ComponentType<IconProps>;
  /** Custom left content (an avatar…), used instead of `Icon`. */
  leftSection?: ReactNode;
  /** Badges shown next to the title. */
  titleBadges?: ReactNode;
  /** Action on the right (button, switch, badge). */
  rightSection?: ReactNode;
  disabled?: boolean;
  className?: string;
}

/** One line inside a `SettingsCard`: icon, title, description and an action. */
export function SettingsRow({
  title,
  description,
  Icon,
  leftSection,
  titleBadges,
  rightSection,
  disabled = false,
  className,
}: Props) {
  return (
    <Group
      wrap={"nowrap"}
      gap={16}
      className={cn("w-full px-5 py-4", className)}
    >
      {leftSection ?? (Icon && <SettingsIconTile Icon={Icon} />)}
      <Stack gap={4} className={cn("min-w-0 flex-1", disabled && "opacity-60")}>
        <Group gap={8} wrap={"wrap"}>
          <Text fz={14} fw={600} c={"white"} lh={"normal"}>
            {title}
          </Text>
          {titleBadges}
        </Group>
        {description && (
          <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
            {description}
          </Text>
        )}
      </Stack>
      {rightSection && <Box className={"shrink-0"}>{rightSection}</Box>}
    </Group>
  );
}
