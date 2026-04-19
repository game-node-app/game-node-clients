import {
  PreferredPlatformsViewModal,
  TextLink,
  TGameOrSearchGame,
  useOnMobile,
  useOwnCollectionEntryForGameId,
  usePreferredPlatforms,
  useUserId,
} from "#@/components";
import { Menu, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import {
  CollectionEntry,
  CollectionsEntriesService,
} from "@repo/wrapper/server";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { PropsWithChildren, useMemo } from "react";
import CollectionEntryStatus = CollectionEntry.status;
import { createErrorNotification } from "#@/util/createErrorNotification.ts";

interface QuickAddMenuOption {
  labelKey: string;
  status: CollectionEntryStatus;
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
      },
      {
        labelKey: t("collectionEntry.statuses.finished"),
        status: CollectionEntryStatus.FINISHED,
      },
      {
        labelKey: t("collectionEntry.statuses.planned"),
        status: CollectionEntryStatus.PLANNED,
      },
      {
        labelKey: t("collectionEntry.statuses.dropped"),
        status: CollectionEntryStatus.DROPPED,
      },
      {
        labelKey: t("collectionEntry.statuses.ongoing"),
        status: CollectionEntryStatus.ONGOING,
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

      console.log("Existing collection entry:", collectionEntry);

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

      ownCollectionEntryQuery.invalidate();

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
  });

  return (
    <Menu shadow={"md"} keepMounted withinPortal zIndex={1000}>
      <PreferredPlatformsViewModal
        opened={isPreferredPlatformsModalOpened}
        onClose={preferredPlatformsModalUtils.close}
      />
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t("game.quickActions.menuLabel")}</Menu.Label>
        {QUICK_ADD_OPTIONS.map((option) => {
          return (
            <Menu.Item
              key={option.labelKey}
              onClick={() => {
                quickAddMutation.mutate(option);
              }}
            >
              <Text span className={"text-sm"}>
                {t("game.quickActions.menuActionLabel")}
              </Text>{" "}
              <Text className={"font-bold text-sm"} span>
                {t(option.labelKey as never)}
              </Text>
            </Menu.Item>
          );
        })}
        {dropdownChildren}
      </Menu.Dropdown>
    </Menu>
  );
};

export { GameInfoQuickAddMenu };
