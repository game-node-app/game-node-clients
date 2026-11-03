import {
  PreferredPlatformsViewModal,
  TextLink,
  TGameOrSearchGame,
  useOnMobile,
  useOwnCollectionEntryForGameId,
  usePreferredPlatforms,
} from "#@/components";
import { createErrorNotification } from "#@/util/createErrorNotification.ts";
import { Menu, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import {
  CollectionEntry,
  CollectionsEntriesService,
} from "@repo/wrapper/server";
import {
  IconBookmark,
  IconCircleCheck,
  IconPlayerPause,
  IconPlayerPlay,
  IconRepeat,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import React, { PropsWithChildren, useMemo } from "react";
import CollectionEntryStatus = CollectionEntry.status;

interface QuickAddMenuOption {
  labelKey: string;
  status: CollectionEntryStatus;
  icon: React.ElementType;
}

interface Props {
  game: TGameOrSearchGame;
  onPreferredPlatformSetupClick?: () => void;
  dropdownChildren?: React.ReactNode;
}

const GameInfoQuickAddMenu = ({
  game,
  onPreferredPlatformSetupClick,
  children,
  dropdownChildren,
}: PropsWithChildren<Props>) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();

  // Only used to invalidate the query after quick add, so we can refetch the collection entry with the updated data.
  // We don't use the data from here to avoid unnecessary fetches.
  const ownCollectionEntryQuery = useOwnCollectionEntryForGameId(
    game.id!,
    false,
  );

  const [isPreferredPlatformsModalOpened, preferredPlatformsModalUtils] =
    useDisclosure();

  const preferredPlatformsQuery = usePreferredPlatforms();

  const QUICK_ADD_OPTIONS: QuickAddMenuOption[] = useMemo(
    () => [
      {
        labelKey: t("collectionEntry.statuses.playing"),
        status: CollectionEntryStatus.PLAYING,
        icon: IconPlayerPlay,
      },
      {
        labelKey: t("collectionEntry.statuses.finished"),
        status: CollectionEntryStatus.FINISHED,
        icon: IconCircleCheck,
      },
      {
        labelKey: t("collectionEntry.statuses.planned"),
        status: CollectionEntryStatus.PLANNED,
        icon: IconBookmark,
      },
      {
        labelKey: t("collectionEntry.statuses.dropped"),
        status: CollectionEntryStatus.DROPPED,
        icon: IconPlayerPause,
      },
      {
        labelKey: t("collectionEntry.statuses.ongoing"),
        status: CollectionEntryStatus.ONGOING,
        icon: IconRepeat,
      },
    ],
    [t],
  );

  const quickAddMutation = useMutation({
    mutationFn: async (option: QuickAddMenuOption) => {
      const preferredPlatforms = preferredPlatformsQuery.data ?? [];
      const enabledPreferredPlatforms = preferredPlatforms.filter(
        (p) => p.enabled,
      );
      if (enabledPreferredPlatforms.length === 0) {
        notifications.show({
          title: t("game.quickActions.noPreferredPlatformTitle"),
          message: (
            <Text>
              {t("game.quickActions.noPreferredPlatformMessage")}{" "}
              <TextLink
                href="#"
                onClick={(evt) => {
                  evt.preventDefault();
                  onPreferredPlatformSetupClick?.();
                }}
              >
                {onMobile ? t("actions.tapHere") : t("actions.clickHere")}
              </TextLink>{" "}
              {t("game.quickActions.preferredPlatformSetupSuffix")}
            </Text>
          ),
          color: "red",
          autoClose: 10000,
        });
        return;
      }

      let collectionEntry: CollectionEntry | undefined = undefined;

      try {
        collectionEntry =
          await CollectionsEntriesService.collectionsEntriesControllerFindOwnEntryByGameIdV1(
            game.id!,
          );
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        console.log(
          "No existing collection entry found for game id. Proceeding to create one.",
          game.id,
        );
      }

      if (collectionEntry && collectionEntry.status === option.status) {
        notifications.show({
          title: t("game.quickActions.alreadyInStatusTitle"),
          message: t("game.quickActions.alreadyInStatusMessage"),
          color: "blue",
        });
        return;
      }

      const hasCollectionWithForcedStatus = collectionEntry?.collections.some(
        (c) => c.defaultEntryStatus,
      );

      if (hasCollectionWithForcedStatus) {
        notifications.show({
          title: t("game.quickActions.forcedStatusTitle"),
          message: t("game.quickActions.forcedStatusMessage"),
          color: "red",
        });
        return;
      }

      const collectionIds = collectionEntry?.collections.map((c) => c.id) ?? [];

      const existingPlatforms =
        collectionEntry?.ownedPlatforms.map((p) => p.id) ?? [];

      const preferredPlatformIds = enabledPreferredPlatforms.map(
        (p) => p.platformId,
      );

      const combinedPlatformIds = Array.from(
        new Set([...existingPlatforms, ...preferredPlatformIds]),
      );

      await CollectionsEntriesService.collectionsEntriesControllerCreateOrUpdateV1(
        {
          gameId: game.id!,
          platformIds: combinedPlatformIds,
          status: option.status,
          collectionIds: collectionIds,
        },
      );

      return true;
    },
    onError: createErrorNotification,
    onSuccess: (isActionPerformed: boolean | undefined) => {
      if (isActionPerformed) {
        notifications.show({
          title: t("notifications.titles.success"),
          message: t("game.quickActions.statusUpdated"),
          color: "green",
        });
      }
    },
    onSettled: () => {
      ownCollectionEntryQuery.invalidate();
    },
  });

  return (
    <Menu
      shadow={"md"}
      keepMounted
      withinPortal
      zIndex={1000}
      width={220}
      position={"bottom-start"}
      radius={"md"}
    >
      <PreferredPlatformsViewModal
        opened={isPreferredPlatformsModalOpened}
        onClose={preferredPlatformsModalUtils.close}
      />
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t("game.quickActions.menuActionLabel")}</Menu.Label>
        {QUICK_ADD_OPTIONS.map((option) => (
          <Menu.Item
            key={option.labelKey}
            leftSection={<option.icon size={18} stroke={1.75} />}
            disabled={quickAddMutation.isPending}
            onClick={() => quickAddMutation.mutate(option)}
            className={"font-medium"}
          >
            {t(option.labelKey as never)}
          </Menu.Item>
        ))}
        {dropdownChildren}
      </Menu.Dropdown>
    </Menu>
  );
};

export { GameInfoQuickAddMenu };