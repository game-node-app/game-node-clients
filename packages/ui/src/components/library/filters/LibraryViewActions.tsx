import React, { useMemo } from "react";
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
import { useTranslation } from "@repo/locales";

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
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const isOwnLibrary = ownUserId != undefined && ownUserId === libraryUserId;

  const SORTING_CHIP_DATA = useMemo(
    () => [
      {
        value: "addedDate",
        label: t("library.sorts.addedDate"),
      },
      {
        value: "releaseDate",
        label: t("library.sorts.releaseDate"),
      },
    ],
    [t],
  );

  const COLLECTION_SORTING_CHIP_DATA = useMemo(
    () => [
      {
        value: "userCustom",
        label: t("library.sorts.userOrder"),
      },
      ...SORTING_CHIP_DATA,
    ],
    [t, SORTING_CHIP_DATA],
  );

  return (
    <Group
      {...others}
      className={cn("w-full flex-nowrap gap-xs", others.className)}
    >
      <SortingChip
        data={collectionId ? COLLECTION_SORTING_CHIP_DATA : SORTING_CHIP_DATA}
        value={sortValue}
        onChange={onSort}
      />
      <GameViewLayoutSwitcher mode={"chip"} setLayout={onLayoutChange} />
      <Chip
        checked={includeExtraContent}
        variant={"outline"}
        onChange={() => onExtraContentChange(!includeExtraContent)}
      >
        {t("library.labels.showDLCs")}
      </Chip>
      {isOwnLibrary && (
        <Link href={"/importer"}>
          <ActionChip icon={<IconDownload size={16} />}>
            {t("library.buttons.importGames")}
          </ActionChip>
        </Link>
      )}
    </Group>
  );
};

export { LibraryViewActions };
