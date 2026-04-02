import React from "react";
import {
  GameViewLayoutOption,
  GameViewLayoutSwitcherProps,
} from "#@/components/game/view/layout/GameViewLayoutSwitcher";
import { IconLayoutColumns, IconLayoutList } from "@tabler/icons-react";
import { ActionIcon, Divider, Group, Tooltip } from "@mantine/core";
import { ActionChip } from "#@/components";
import { useTranslation } from "@repo/locales";

interface Props extends GameViewLayoutSwitcherProps {
  layout: GameViewLayoutOption;
}

const GameViewLayoutSwitcherContent = ({ layout, setLayout, mode }: Props) => {
  const { t } = useTranslation();
  const handleLayoutChange = (changeTo: GameViewLayoutOption) => {
    console.log("Changing layout to", changeTo);
    setLayout(changeTo);
  };

  if (mode === "chip") {
    const icon =
      layout === "grid" ? (
        <IconLayoutColumns size={16} />
      ) : (
        <IconLayoutList size={16} />
      );

    return (
      <Group wrap={"nowrap"} gap={"xs"}>
        <ActionChip
          icon={icon}
          onClick={() =>
            handleLayoutChange(layout === "grid" ? "list" : "grid")
          }
        >
          {layout === "grid" ? t("view.grid") : t("view.list")}
        </ActionChip>
      </Group>
    );
  }

  return (
    <Group wrap={"nowrap"} gap={"xs"}>
      <Tooltip label={t("view.grid")} position={"bottom"}>
        <ActionIcon
          size={"md"}
          onClick={() => handleLayoutChange("grid")}
          variant={layout === "grid" ? "filled" : "outline"}
        >
          <IconLayoutColumns />
        </ActionIcon>
      </Tooltip>
      <Divider orientation={"vertical"} />
      <Tooltip label={t("view.list")} position={"bottom"}>
        <ActionIcon
          size={"md"}
          onClick={() => handleLayoutChange("list")}
          variant={layout === "list" ? "filled" : "outline"}
        >
          <IconLayoutList />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

export { GameViewLayoutSwitcherContent };
