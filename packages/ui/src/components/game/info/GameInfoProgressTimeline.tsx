import React, { useEffect, useState } from "react";
import { useOwnCollectionEntryForGameId } from "#@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { useReviewForUserIdAndGameId } from "#@/components/review/hooks/useReviewForUserIdAndGameId";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { Group, Stack, Text, Timeline } from "@mantine/core";
import {
  IconCheck,
  IconCircleCheck,
  IconCircleCheckFilled,
  IconLibrary,
  IconMessage,
} from "@tabler/icons-react";
import { useAccumulatedPlaytimeForGame } from "#@/components/playtime/hooks/useAccumulatedPlaytimeForGame";

interface Props {
  gameId: number;
}

const GameInfoProgressTimeline = ({ gameId }: Props) => {
  const userId = useUserId();
  const [maxActiveIndex, setMaxActiveIndex] = useState<number>(-1);

  const collectionEntryQuery = useOwnCollectionEntryForGameId(gameId);
  const reviewQuery = useReviewForUserIdAndGameId(userId, gameId);

  const isInCollection = collectionEntryQuery.data != undefined;
  const isFinished =
    collectionEntryQuery.data != undefined &&
    collectionEntryQuery.data.finishedAt != undefined;
  const isReviewed = reviewQuery.data != undefined;

  useEffect(() => {
    if (isInCollection && isReviewed && isFinished) {
      setMaxActiveIndex(2);
    } else if (isInCollection && isReviewed) {
      setMaxActiveIndex(1);
    } else if (isInCollection) {
      setMaxActiveIndex(0);
    } else {
      setMaxActiveIndex(-1);
    }
  }, [isInCollection, isFinished, isReviewed]);

  return (
    <DetailsBox
      title={"Your progress"}
      withPadding
      stackProps={{
        className: "w-full p-md bg-paper-alt-0",
      }}
    >
      <Timeline active={maxActiveIndex} bulletSize={30}>
        <Timeline.Item title={"Added"} bullet={<IconLibrary />}>
          <Text c={"dimmed"}>Game added to your collection</Text>
          {isInCollection && (
            <Text c={"dimmed"} fz={"xs"}>
              +30 XP
            </Text>
          )}
        </Timeline.Item>
        <Timeline.Item title={"Reviewed"} bullet={<IconMessage />}>
          <Text c={"dimmed"}>Game reviewed</Text>
          {isReviewed && (
            <Text c={"dimmed"} fz={"xs"}>
              +75 XP
            </Text>
          )}
        </Timeline.Item>
        <Timeline.Item title={"Finished"} bullet={<IconCheck />}>
          <Text c={"dimmed"}>Game marked as finished</Text>
          {isFinished && (
            <Text c={"dimmed"} fz={"xs"}>
              +30 XP
            </Text>
          )}
        </Timeline.Item>
      </Timeline>
    </DetailsBox>
  );
};

export { GameInfoProgressTimeline };
