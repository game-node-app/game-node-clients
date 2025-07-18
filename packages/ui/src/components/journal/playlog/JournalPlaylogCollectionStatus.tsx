import React, { useMemo } from "react";
import { JournalPlaylogEntryDto } from "@repo/wrapper/server";
import { getCollectionEntryStatusName } from "#@/components";
import { match } from "ts-pattern";
import { Stack, Text } from "@mantine/core";

interface Props {
  items: JournalPlaylogEntryDto[];
}

const JournalPlaylogCollectionStatus = ({ items }: Props) => {
  const renderedStatusTexts = useMemo(() => {
    return items.map((item) => {
      return match(item.entryStatus!)
        .with(JournalPlaylogEntryDto.entryStatus.PLAYING, () => (
          <Text>Started Playing</Text>
        ))
        .with(JournalPlaylogEntryDto.entryStatus.FINISHED, () => (
          <Text>Marked game as finished</Text>
        ))
        .with(JournalPlaylogEntryDto.entryStatus.DROPPED, () => (
          <Text>Dropped game</Text>
        ))
        .with(JournalPlaylogEntryDto.entryStatus.PLANNED, () => (
          <Text>Added game to Wishlist</Text>
        ))
        .otherwise(() => <Text>Unknown</Text>);
    });
  }, [items]);

  return (
    <Stack className={"w-full gap-2 bg-paper p-4"}>{renderedStatusTexts}</Stack>
  );
};

export { JournalPlaylogCollectionStatus };
