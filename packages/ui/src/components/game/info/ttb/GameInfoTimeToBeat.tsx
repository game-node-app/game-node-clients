import React, { useEffect, useMemo } from "react";
import {
  DetailsBox,
  GameInfoTimeToBeatItem,
  useTimeToBeat,
} from "#@/components";
import { createErrorNotification, Link } from "#@/util";
import { Anchor, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  gameId: number;
}

const GameInfoTimeToBeat = ({ gameId }: Props) => {
  const { t } = useTranslation();
  const { data, isLoading } = useTimeToBeat(gameId);

  const renderedSubmissionInfo = useMemo(() => {
    if (isLoading) {
      return null;
    }

    if (data == undefined || !data.submitCount) {
      return (
        <Text className={"text-center text-sm text-dimmed"}>
          {t("game.ttb.notEnoughSubmissions")}
        </Text>
      );
    }

    return (
      <Text className={"text-center text-sm text-dimmed"}>
        {t("game.ttb.basedOnIgdb", { count: data.submitCount })}{" "}
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
      title={t("game.ttb.title")}
      withPadding
      withBorder
      withDimmedTitle
      withBackground
      withRipple
    >
      <GameInfoTimeToBeatItem
        title={t("game.ttb.mainStory")}
        seconds={data?.main ?? 0}
        isLoading={isLoading}
        description={t("game.ttb.mainStoryDesc")}
      />
      <GameInfoTimeToBeatItem
        title={t("game.ttb.mainExtras")}
        seconds={data?.mainPlusSides ?? 0}
        isLoading={isLoading}
        description={t("game.ttb.mainExtrasDesc")}
      />
      <GameInfoTimeToBeatItem
        title={t("game.ttb.completionist")}
        seconds={data?.completionist ?? 0}
        isLoading={isLoading}
        description={t("game.ttb.completionistDesc")}
      />
      {renderedSubmissionInfo}
    </DetailsBox>
  );
};

export { GameInfoTimeToBeat };
