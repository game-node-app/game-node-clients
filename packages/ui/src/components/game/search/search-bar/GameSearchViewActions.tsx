import React from "react";
import { Chip, Group } from "@mantine/core";
import { GameView, GameViewLayoutOption } from "#@/components";
import { useTranslation } from "@repo/locales";

interface Props {
  includeExtraContent: boolean;
  onExtraContentChange: (includeExtraContent: boolean) => void;
  onLayoutChange?: (layout: GameViewLayoutOption) => void;
}

const GameSearchViewActions = ({
  includeExtraContent,
  onExtraContentChange,
  onLayoutChange,
}: Props) => {
  const { t } = useTranslation();
  return (
    <Group className={"w-full flex-nowrap gap-sm overflow-x-hidden"}>
      {onLayoutChange && (
        <GameView.LayoutSwitcher mode={"chip"} setLayout={onLayoutChange} />
      )}
      <Chip
        variant={"outline"}
        checked={includeExtraContent}
        onChange={onExtraContentChange}
      >
        {t("library.labels.showDLCs")}
      </Chip>
    </Group>
  );
};

export { GameSearchViewActions };
