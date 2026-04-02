import React, { useMemo } from "react";
import { JournalPlaylogEntryDto } from "@repo/wrapper/server";
import { getCollectionEntryStatusName } from "#@/components";
import { match } from "ts-pattern";
import { Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  items: JournalPlaylogEntryDto[];
}

const JournalPlaylogCollectionStatus = ({ items }: Props) => {
  const { t } = useTranslation();
  const renderedStatusTexts = useMemo(() => {
    return items.map((item) => {
      return match(item.entryStatus!)
        .with(JournalPlaylogEntryDto.entryStatus.PLAYING, () => (
          <Text>{t("collectionEntry.timeline.startedPlaying")}</Text>
        ))
        .with(JournalPlaylogEntryDto.entryStatus.FINISHED, () => (
          <Text>{t("collectionEntry.timeline.markedFinished")}</Text>
        ))
        .with(JournalPlaylogEntryDto.entryStatus.DROPPED, () => (
          <Text>{t("collectionEntry.timeline.droppedGame")}</Text>
        ))
        .with(JournalPlaylogEntryDto.entryStatus.PLANNED, () => (
          <Text>{t("collectionEntry.timeline.addedWishlist")}</Text>
        ))
        .otherwise(() => <Text>{t("collectionEntry.timeline.unknown")}</Text>);
    });
  }, [items, t]);

  return (
    <Stack className={"w-full gap-2 bg-paper p-4"}>{renderedStatusTexts}</Stack>
  );
};

export { JournalPlaylogCollectionStatus };
