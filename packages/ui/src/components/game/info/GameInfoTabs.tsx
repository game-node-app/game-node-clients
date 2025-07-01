import React, { PropsWithChildren } from "react";
import { Box, Stack, Tabs } from "@mantine/core";
import {
  IconHomeFilled,
  IconStarsFilled,
  IconTrophyFilled,
  IconVocabulary,
} from "@tabler/icons-react";

export enum GameInfoTabValue {
  overview = "overview",
  reviews = "reviews",
  discussion = "discussion",
  achievements = "achievements",
}

interface Props extends PropsWithChildren {
  currentTab: GameInfoTabValue;
  onChange: (tab: GameInfoTabValue) => void;
}

const GameInfoTabs = ({ currentTab, onChange, children }: Props) => {
  return (
    <Tabs
      value={currentTab}
      variant={"default"}
      onChange={(v) => {
        onChange(v as GameInfoTabValue);
      }}
      radius="md"
      defaultValue="overview"
      classNames={{
        tabSection: "me-0 block lg:hidden",
        tabLabel: "hidden lg:block text-lg",
      }}
    >
      <Tabs.List grow>
        <Tabs.Tab value={"overview"} leftSection={<IconHomeFilled size={28} />}>
          Overview
        </Tabs.Tab>
        <Tabs.Tab value={"reviews"} leftSection={<IconStarsFilled size={28} />}>
          Reviews
        </Tabs.Tab>
        <Tabs.Tab
          value={"discussion"}
          leftSection={<IconVocabulary size={28} />}
        >
          Discussion
        </Tabs.Tab>
        <Tabs.Tab
          value={"achievements"}
          leftSection={<IconTrophyFilled size={28} />}
        >
          Achievements
        </Tabs.Tab>
      </Tabs.List>
      {children}
    </Tabs>
  );
};

export { GameInfoTabs };
