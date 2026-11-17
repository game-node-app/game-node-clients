import {
  ActionIcon,
  Box,
  Menu,
  Stack,
  Text,
  Tooltip,
  type ActionIconProps,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { IconCheck } from "@tabler/icons-react";
import type { LibraryVisibilityLevel } from "./LibraryVisibilityLevel";
import { ReviewsAlwaysPublicNote } from "./ReviewsAlwaysPublicNote";
import { useCollectionEntryVisibilityMutation } from "./useCollectionEntryVisibilityMutation";
import { useLibraryVisibilityOptions } from "./useLibraryVisibilityOptions";

export interface CollectionEntryVisibilityMenuProps {
  /** Game id: the visibility route is scoped to the game, not the entry. */
  gameId: number;
  /** The entry's current level, used to mark the selected option. */
  value: LibraryVisibilityLevel;
  size?: ActionIconProps["size"];
  className?: string;
}

/**
 * Owner-only quick action for changing one game's library visibility.
 *
 * Renders the same three levels as the entry form (via
 * `useLibraryVisibilityOptions`) and calls the dedicated visibility route
 * through `useCollectionEntryVisibilityMutation`, so the cached entry updates
 * optimistically and rolls back with an error notification on failure.
 *
 * Callers must only render it for the viewer's own entries.
 */
export function CollectionEntryVisibilityMenu({
  gameId,
  value,
  size,
  className,
}: CollectionEntryVisibilityMenuProps) {
  const { t } = useTranslation();
  const options = useLibraryVisibilityOptions();
  const mutation = useCollectionEntryVisibilityMutation();

  const currentOption =
    options.find((option) => option.value === value) ?? options[0];
  const CurrentIcon = currentOption.icon;

  return (
    <Menu
      shadow={"md"}
      position={"bottom-end"}
      width={300}
      withinPortal
      keepMounted
    >
      <Menu.Target>
        <Tooltip label={t("libraryVisibility.actions.changeVisibility")}>
          <ActionIcon
            aria-label={t("libraryVisibility.actions.changeVisibility")}
            className={className}
            size={size}
            variant={"default"}
            disabled={mutation.isPending}
          >
            <CurrentIcon size={"1.05rem"} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t("libraryVisibility.labels.visibility")}</Menu.Label>
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
        <Menu.Divider />
        <Box px={"sm"} py={"xs"}>
          <ReviewsAlwaysPublicNote />
        </Box>
      </Menu.Dropdown>
    </Menu>
  );
}
