import React from "react";
import { Chip, Group } from "@mantine/core";
import {
  ActionChip,
  GameViewLayoutOption,
  GameViewLayoutSwitcher,
  SortingChip,
  useUserId,
} from "#@/components";
import { IconDownload } from "@tabler/icons-react";
import { Link } from "#@/util";

interface Props {
  libraryUserId: string;
  includeExtraContent: boolean;
  onSort: (value: string, order: "ASC" | "DESC") => void;
  onLayoutChange: (layout: GameViewLayoutOption) => void;
  onExtraContentChange: (value: boolean) => void;
}

const LibraryViewActions = ({
  libraryUserId,
  onSort,
  onLayoutChange,
  includeExtraContent,
  onExtraContentChange,
}: Props) => {
  const ownUserId = useUserId();
  const isOwnLibrary = ownUserId != undefined && ownUserId === libraryUserId;
  return (
    <Group className={"w-full flex-nowrap gap-xs"}>
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
        Show DLCs/Extras
      </Chip>
      {isOwnLibrary && (
        <Link href={"/importer"}>
          <ActionChip icon={<IconDownload size={16} />}>
            Import games
          </ActionChip>
        </Link>
      )}
    </Group>
  );
};

export { LibraryViewActions };
