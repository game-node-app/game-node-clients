import { Box, Group, Stack, Text } from "@mantine/core";
import { PropsWithChildren, ReactNode } from "react";
import { getSettingsSectionId } from "#@/components/settings/settingsTabs";
import { cn } from "#@/util";

interface Props extends PropsWithChildren {
  title: ReactNode;
  description?: ReactNode;
  /** Extra content on the right side of the header (a badge, a "saved" mark…). */
  rightSection?: ReactNode;
  /** Anchor used by `?section=` and the sidebar sub-items. */
  sectionId?: string;
  className?: string;
}

/** Titled group of settings inside a tab panel (Figma "Section"). */
export function SettingsSection({
  title,
  description,
  rightSection,
  sectionId,
  className,
  children,
}: Props) {
  return (
    <Stack
      component={"section"}
      id={sectionId ? getSettingsSectionId(sectionId) : undefined}
      data-settings-section={sectionId}
      gap={16}
      className={cn("w-full scroll-mt-4", className)}
    >
      <Group gap={12} wrap={"nowrap"} align={"flex-end"}>
        <Stack gap={4} className={"flex-1 min-w-0"}>
          <Text fz={16} fw={500} c={"white"} lh={"normal"}>
            {title}
          </Text>
          {description && (
            <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
              {description}
            </Text>
          )}
        </Stack>
        {rightSection && <Box className={"shrink-0"}>{rightSection}</Box>}
      </Group>
      {children}
    </Stack>
  );
}
