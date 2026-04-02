import React, { PropsWithChildren } from "react";
import { Tabs, TabsProps } from "@mantine/core";
import {
  IconHomeFilled,
  IconStarsFilled,
  IconTrophyFilled,
  IconVocabulary,
} from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";

export interface GameInfoTabIcons {
  home: React.ReactNode;
  reviews: React.ReactNode;
  discussion: React.ReactNode;
  achievements: React.ReactNode;
}

const DEFAULT_TAB_ICONS: GameInfoTabIcons = {
  home: <IconHomeFilled size={28} />,
  reviews: <IconStarsFilled size={28} />,
  discussion: <IconVocabulary size={28} />,
  achievements: <IconTrophyFilled size={28} />,
};

export enum GameInfoTabValue {
  overview = "overview",
  reviews = "reviews",
  discussion = "discussion",
  achievements = "achievements",
}

interface Props extends PropsWithChildren<Omit<TabsProps, "onChange">> {
  currentTab: GameInfoTabValue;
  onChange: (tab: GameInfoTabValue) => void;
  icons?: Partial<GameInfoTabIcons>;
}

const GameInfoTabs = ({
  currentTab,
  onChange,
  children,
  icons = DEFAULT_TAB_ICONS,
  ...others
}: Props) => {
  const { t } = useTranslation();
  return (
    <Tabs
      value={currentTab}
      variant={"default"}
      onChange={(v) => {
        onChange(v as GameInfoTabValue);
      }}
      radius="md"
      defaultValue="overview"
      {...others}
      classNames={{
        tabSection: "me-0 block lg:hidden",
        tabLabel: "hidden lg:block text-lg",
        tab: "flex justify-center",
      }}
    >
      <Tabs.List grow>
        <Tabs.Tab value={"overview"} leftSection={icons?.home}>
          {t("game.tabs.overview")}
        </Tabs.Tab>
        <Tabs.Tab value={"reviews"} leftSection={icons?.reviews}>
          {t("game.tabs.reviews")}
        </Tabs.Tab>
        <Tabs.Tab value={"discussion"} leftSection={icons?.discussion}>
          {t("game.tabs.discussion")}
        </Tabs.Tab>
        <Tabs.Tab value={"achievements"} leftSection={icons?.achievements}>
          {t("game.tabs.achievements")}
        </Tabs.Tab>
      </Tabs.List>
      {children}
    </Tabs>
  );
};

export { GameInfoTabs };
