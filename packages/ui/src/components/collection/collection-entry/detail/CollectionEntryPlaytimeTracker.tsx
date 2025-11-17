import React, { useMemo } from "react";
import {
  DetailsBox,
  DetailsBoxProps,
  useCollectionEntry,
  usePlaytimeForGame,
  UserPlaytimeItem,
} from "#@/components";
import { Skeleton, Text } from "@mantine/core";

interface Props extends Omit<DetailsBoxProps, "title"> {
  userId: string;
  collectionEntryId: string;
}

const CollectionEntryPlaytimeTracker = ({
  userId,
  collectionEntryId,
  ...others
}: Props) => {
  const collectionEntryQuery = useCollectionEntry(collectionEntryId);

  const playtimeQuery = usePlaytimeForGame(
    userId,
    collectionEntryQuery.data?.gameId,
  );

  const isLoading = collectionEntryQuery.isLoading || playtimeQuery.isLoading;

  const isEmpty = !isLoading && playtimeQuery.data?.length === 0;

  const playtimes = playtimeQuery.data;

  const items = useMemo(() => {
    return playtimes?.map((playtime) => (
      <UserPlaytimeItem
        key={playtime.id}
        playtime={playtime}
        variant={"detailed"}
      />
    ));
  }, [playtimes]);

  return (
    <DetailsBox withPadding withBorder {...others} title={"Play sessions"}>
      {isLoading &&
        new Array(3)
          .fill(0)
          .map((_, i) => <Skeleton className={"w-full h-10"} key={i} />)}
      {isEmpty && (
        <Text className={"text-center text-sm"}>
          No play sessions found for this game.
        </Text>
      )}
      {items}
    </DetailsBox>
  );
};

export { CollectionEntryPlaytimeTracker };
