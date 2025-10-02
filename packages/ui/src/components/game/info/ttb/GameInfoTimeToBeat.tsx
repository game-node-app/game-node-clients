import React, { useEffect, useMemo } from "react";
import {
  DetailsBox,
  GameInfoTimeToBeatItem,
  useTimeToBeat,
} from "#@/components";
import { createErrorNotification, Link } from "#@/util";
import { Anchor, Text } from "@mantine/core";

interface Props {
  gameId: number;
}

const GameInfoTimeToBeat = ({ gameId }: Props) => {
  const { data, isLoading } = useTimeToBeat(gameId);

  const renderedSubmissionInfo = useMemo(() => {
    if (isLoading) {
      return null;
    }

    if (data == undefined || !data.submitCount) {
      return (
        <Text className={"text-center text-sm text-dimmed"}>
          Not enough submissions.
        </Text>
      );
    }

    return (
      <Text className={"text-center text-sm text-dimmed"}>
        Based on {data.submitCount} submissions to{" "}
        <Anchor
          target={"_blank"}
          href={"https://igdb.com"}
          className={"text-sm"}
        >
          IGDB
        </Anchor>
        .
      </Text>
    );
  }, [data, isLoading]);

  return (
    <DetailsBox
      title={"Time to beat"}
      withPadding
      withBorder
      withDimmedTitle
      withBackground
      withRipple
    >
      <GameInfoTimeToBeatItem
        title={"Main Story"}
        seconds={data?.main ?? 0}
        isLoading={isLoading}
        description={
          "Average time to finish the game to its credits without spending notable time on extras such as side quests."
        }
      />
      <GameInfoTimeToBeatItem
        title={"Main + Extras"}
        seconds={data?.mainPlusSides ?? 0}
        isLoading={isLoading}
        description={
          "Average time to finish the game while mixing in some extras such as side quests without being overly thorough."
        }
      />
      <GameInfoTimeToBeatItem
        title={"100%"}
        seconds={data?.completionist ?? 0}
        isLoading={isLoading}
        description={"Average time to finish the game to 100% completion."}
      />
      {renderedSubmissionInfo}
    </DetailsBox>
  );
};

export { GameInfoTimeToBeat };
