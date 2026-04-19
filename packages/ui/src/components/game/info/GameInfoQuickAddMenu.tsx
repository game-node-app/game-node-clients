import {
  PreferredPlatformsViewModal,
  TextLink,
  TGameOrSearchGame,
  useOnMobile,
  usePreferredPlatforms,
} from "#@/components";
import { Menu, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { CollectionEntry } from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import React, { PropsWithChildren, useMemo } from "react";
import CollectionEntryStatus = CollectionEntry.status;

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
