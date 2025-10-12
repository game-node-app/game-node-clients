import React from "react";
import { Chip, Group, GroupProps } from "@mantine/core";
import {
  ActionChip,
  GameViewLayoutOption,
  GameViewLayoutSwitcher,
  SortingChip,
  SortingChipValue,
  useUserId,
} from "#@/components";
import { IconDownload } from "@tabler/icons-react";
import { cn, Link } from "#@/util";

const SORTING_CHIP_DATA = [
  {
    value: "addedDate",
    label: "Added Date",
  },
  {
    value: "releaseDate",
    label: "Release Date",
  },
];

const COLLECTION_SORTING_CHIP_DATA = [
  {
    value: "userCustom",
    label: "User Order",
  },
  ...SORTING_CHIP_DATA,
];

interface Props extends GroupProps {
  libraryUserId: string;
  collectionId?: string;
  includeExtraContent: boolean;
  sortValue: SortingChipValue;
  onSort: (updatedValue: SortingChipValue) => void;
  onLayoutChange: (layout: GameViewLayoutOption) => void;
  onExtraContentChange: (value: boolean) => void;
}

const LibraryViewActions = ({
  libraryUserId,
  collectionId,
  sortValue,
  onSort,
  onLayoutChange,
  includeExtraContent,
  onExtraContentChange,
  ...others
}: Props) => {
  const ownUserId = useUserId();
  const isOwnLibrary = ownUserId != undefined && ownUserId === libraryUserId;

  return (
    <Group
      {...others}
      className={cn("w-full flex-nowrap gap-xs", others.className)}
    >
      <SortingChip
        data={COLLECTION_SORTING_CHIP_DATA}
        value={sortValue}
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
