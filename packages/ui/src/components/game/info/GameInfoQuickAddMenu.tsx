import React, { PropsWithChildren } from "react";
import { TGameOrSearchGame, usePreferredPlatforms } from "#@/components";
import { Menu, Text } from "@mantine/core";
import { CollectionEntry } from "@repo/wrapper/server";
import CollectionEntryStatus = CollectionEntry.status;
import { useTranslation, TranslationSchema } from "@repo/locales";
import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";

interface QuickAddMenuOption {
  labelKey: keyof TranslationSchema["collectionEntry"]["statuses"];
  status: CollectionEntryStatus;
}

const QUICK_ADD_OPTIONS: QuickAddMenuOption[] = [
  {
    labelKey: "playing",
    status: CollectionEntryStatus.PLAYING,
  },
  {
    labelKey: "finished",
    status: CollectionEntryStatus.FINISHED,
  },
];

interface Props {
  game: TGameOrSearchGame;
}

const GameInfoQuickAddMenu = ({ game, children }: PropsWithChildren<Props>) => {
  const { t } = useTranslation();

  const preferredPlatformsQuery = usePreferredPlatforms();

  const quickAddMutation = useMutation({
    mutationFn: async () => {
      const preferredPlatforms = preferredPlatformsQuery.data ?? [];
      if (preferredPlatforms.length === 0) {
        notifications.show({
          title: t("game.quickActions.noPreferredPlatformTitle"),
          message: t("game.quickActions.noPreferredPlatformMessage"),
          color: "red",
        });
        return;
      }
    },
  });

  return (
    <Menu shadow={"md"} zIndex={99999}>
      <Menu.Target>{children}</Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t("game.quickActions.menuLabel")}</Menu.Label>
        {QUICK_ADD_OPTIONS.map((option) => {
          return (
            <Menu.Item key={option.labelKey}>
              <Text span className={"text-sm"}>
                {t("game.quickActions.menuActionLabel")}
              </Text>{" "}
              <Text className={"font-bold text-sm"} span>
                {t(`collectionEntry.statuses.${option.labelKey}` as never)}
              </Text>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};

export { GameInfoQuickAddMenu };
