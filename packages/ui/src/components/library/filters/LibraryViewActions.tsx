import React from "react";
import { Chip, Group } from "@mantine/core";
import {
  GameViewLayoutOption,
  GameViewLayoutSwitcher,
  SortingChip,
} from "#@/components";

interface Props {
  includeExtraContent: boolean;
  onSort: (value: string, order: "ASC" | "DESC") => void;
  onLayoutChange: (layout: GameViewLayoutOption) => void;
  onExtraContentChange: (value: boolean) => void;
}

const LibraryViewActions = ({
  onSort,
  onLayoutChange,
  includeExtraContent,
  onExtraContentChange,
}: Props) => {
  return (
    <Group className={"flex-nowrap w-full gap-xs"}>
      <SortingChip
        data={[
          {
            value: "addedDate",
            label: "Added Date",
          },
          {
            value: "releaseDate",
            label: "Release Date",
          },
        ]}
        defaultValue={"addedDate"}
        onChange={onSort}
      />
      <GameViewLayoutSwitcher mode={"chip"} setLayout={onLayoutChange} />
      <Chip
        checked={includeExtraContent}
        variant={"outline"}
        onChange={() => onExtraContentChange(!includeExtraContent)}
      >
        {includeExtraContent ? "Show" : "Hide"} DLCs/Extras
      </Chip>
    </Group>
  );
};

export { LibraryViewActions };
