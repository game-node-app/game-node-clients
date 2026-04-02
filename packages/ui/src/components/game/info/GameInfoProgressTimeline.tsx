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
import { useTranslation } from "@repo/locales";

interface Props {
  gameId: number;
}

const GameInfoProgressTimeline = ({ gameId }: Props) => {
  const { t } = useTranslation();
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
      title={t("game.progress.yourProgress")}
      withDimmedTitle
      withPadding
      withBackground
    >
      <Timeline active={maxActiveIndex} bulletSize={30} variant={"default"}>
        <Timeline.Item
          title={t("game.progress.added")}
          bullet={<IconLibrary />}
          variant={"default"}
        >
          <Text c={"dimmed"}>{t("game.timeline.added")}</Text>
          {isInCollection && (
            <Text c={"dimmed"} fz={"xs"}>
              {t("game.progress.xpGained", { xp: 30 })}
            </Text>
          )}
        </Timeline.Item>
        <Timeline.Item
          title={t("game.progress.reviewed")}
          bullet={<IconMessage />}
          variant={"default"}
        >
          <Text c={"dimmed"}>{t("game.timeline.reviewed")}</Text>
          {isReviewed && (
            <Text c={"dimmed"} fz={"xs"}>
              {t("game.progress.xpGained", { xp: 75 })}
            </Text>
          )}
        </Timeline.Item>
        <Timeline.Item
          title={t("game.progress.finished")}
          bullet={<IconCheck />}
          variant={"default"}
        >
          <Text c={"dimmed"}>{t("game.timeline.finished")}</Text>
          {isFinished && (
            <Text c={"dimmed"} fz={"xs"}>
              {t("game.progress.xpGained", { xp: 30 })}
            </Text>
          )}
        </Timeline.Item>
      </Timeline>
    </DetailsBox>
  );
};

export { GameInfoProgressTimeline };
