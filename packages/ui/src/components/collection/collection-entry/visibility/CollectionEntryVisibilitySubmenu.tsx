import { Group, Menu, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconCheck, IconChevronRight } from "@tabler/icons-react";
import type { LibraryVisibilityLevel } from "./LibraryVisibilityLevel";
import { useCollectionEntryVisibilityMutation } from "./useCollectionEntryVisibilityMutation";
import { useLibraryVisibilityOptions } from "./useLibraryVisibilityOptions";

export interface CollectionEntryVisibilitySubmenuProps {
  /** Game id: the visibility route is scoped to the game, not the entry. */
  gameId: number;
  /** The entry's current level, shown on the item and marked in the list. */
  value: LibraryVisibilityLevel;
}

/**
 * Owner-only "Visibility" submenu, meant to be rendered inside an existing
 * `Menu.Dropdown`. It shows the current level on its trigger so the entry's
 * privacy stays visible without a dedicated button, and uses the same
 * mutation (optimistic update, rollback on error) as
 * `CollectionEntryVisibilityMenu`.
 *
 * Callers must only render it for the viewer's own entries.
 */
export function CollectionEntryVisibilitySubmenu({
  gameId,
  value,
}: CollectionEntryVisibilitySubmenuProps) {
  const { t } = useTranslation();
  const options = useLibraryVisibilityOptions();
  const mutation = useCollectionEntryVisibilityMutation();

  const currentOption =
    options.find((option) => option.value === value) ?? options[0];
  const CurrentIcon = currentOption.icon;

  return (
    <Menu.Sub
      withinPortal
      position={"left-start"}
      openDelay={100}
      closeDelay={200}
    >
      <Menu.Sub.Target>
        <Menu.Sub.Item
          leftSection={<CurrentIcon size={16} />}
          rightSection={
            <Group gap={4} wrap={"nowrap"}>
              <Text size={"xs"} c={"dimmed"}>
                {currentOption.label}
              </Text>
              <IconChevronRight size={14} />
            </Group>
          }
          disabled={mutation.isPending}
        >
          {t("libraryVisibility.labels.visibility")}
        </Menu.Sub.Item>
      </Menu.Sub.Target>
      <Menu.Sub.Dropdown miw={260}>
        {options.map((option) => {
          const Icon = option.icon;
          const isCurrent = option.value === value;

          return (
            <Menu.Item
              key={option.value}
              leftSection={<Icon size={16} />}
              rightSection={
                isCurrent ? <IconCheck size={16} aria-hidden /> : undefined
              }
              onClick={() => {
                if (isCurrent) {
                  return;
                }

                mutation.mutate(
                  { gameId, visibility: option.value },
                  {
                    onSuccess: () => {
                      notifications.show({
                        color: "green",
                        message: t(
                          "libraryVisibility.messages.entryUpdateSuccess",
                        ),
                      });
                    },
                  },
                );
              }}
            >
              <Stack gap={0}>
                <Text size={"sm"}>{option.label}</Text>
                <Text size={"xs"} c={"dimmed"}>
                  {option.description}
                </Text>
              </Stack>
            </Menu.Item>
          );
        })}
      </Menu.Sub.Dropdown>
    </Menu.Sub>
  );
}
