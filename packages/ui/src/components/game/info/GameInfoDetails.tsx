import React from "react";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import { Game } from "@repo/wrapper/server";
import { getLocalizedFirstReleaseDate } from "#@/components/game/util/getLocalizedFirstReleaseDate";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { GameInfoPlatforms } from "#@/components/game/info/GameInfoPlatforms";
import { GameInfoDetailsDeveloperInfo } from "#@/components/game/info/GameInfoDetailsDeveloperInfo";
import { GameInfoDetailsTags } from "#@/components/game/info/GameInfoDetailsTags";
import { GameInfoScore } from "#@/components/game/info/GameInfoScore";
import { GameInfoExternalStores } from "#@/components/game/info/GameInfoExternalStores";
import { GameInfoProgressTimeline } from "#@/components/game/info/GameInfoProgressTimeline";
import { GameInfoPlaytimeTracker } from "#@/components/game/info/GameInfoPlaytimeTracker";
import { GameInfoAchievementOverview, GameInfoTimeToBeat } from "#@/components";
import { useTranslation } from "@repo/locales";

interface IGameInfoDetailsProps {
  game: Game | undefined;
}

const GameInfoDetails = ({ game }: IGameInfoDetailsProps) => {
  const { t } = useTranslation();
  if (!game) {
    return null;
  }

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} w={"100%"} p={0}>
      <DetailsBox
        withBorder
        withDimmedTitle
        title={t("game.details.launchDate")}
        withPadding
        withBackground
        withRipple
      >
        <Text>
          {getLocalizedFirstReleaseDate(game.firstReleaseDate) ??
            t("game.details.notAvailable")}
        </Text>
      </DetailsBox>
      <GameInfoDetailsDeveloperInfo gameId={game.id} />
      <GameInfoDetailsTags gameId={game.id} />
      <DetailsBox
        title={t("game.details.whereToPlay")}
        withBorder
        withDimmedTitle
        withPadding
        withBackground
        withRipple
      >
        <GameInfoPlatforms gameId={game.id} className={"my-4 gap-5"} />
      </DetailsBox>
      <DetailsBox
        title={t("game.details.whereToBuy")}
        withBorder
        withDimmedTitle
        withPadding
        withBackground
        withRipple
      >
        <GameInfoExternalStores gameId={game.id} className={"my-4 gap-5"} />
      </DetailsBox>

      <DetailsBox
        withBorder
        withDimmedTitle
        title={t("game.details.summary")}
        withPadding
        withBackground
        withRipple
      >
        {game.summary ?? t("game.details.notAvailable")}
      </DetailsBox>
      <GameInfoScore gameId={game.id} />
      <GameInfoTimeToBeat gameId={game.id} />
    </SimpleGrid>
  );
};

export { GameInfoDetails };
