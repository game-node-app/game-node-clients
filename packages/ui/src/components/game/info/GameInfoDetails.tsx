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

interface IGameInfoDetailsProps {
  game: Game | undefined;
}

const GameInfoDetails = ({ game }: IGameInfoDetailsProps) => {
  if (!game) {
    return null;
  }

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} w={"100%"} p={0}>
      <DetailsBox withBorder withDimmedTitle title={"Launch date"} withPadding>
        <Text>
          {getLocalizedFirstReleaseDate(game.firstReleaseDate) ??
            "Not available"}
        </Text>
      </DetailsBox>
      <GameInfoDetailsDeveloperInfo gameId={game.id} />
      <GameInfoDetailsTags gameId={game.id} />
      <DetailsBox
        title={"Where to play"}
        withBorder
        withDimmedTitle
        withPadding
      >
        <GameInfoPlatforms gameId={game.id} className={"my-4 gap-5"} />
      </DetailsBox>
      <DetailsBox title={"Where to buy"} withBorder withDimmedTitle withPadding>
        <GameInfoExternalStores gameId={game.id} className={"my-4 gap-5"} />
      </DetailsBox>

      <DetailsBox withBorder withDimmedTitle title={"Summary"} withPadding>
        {game.summary ?? "Not available"}
      </DetailsBox>
      <GameInfoScore gameId={game.id} />
      <GameInfoTimeToBeat gameId={game.id} />
    </SimpleGrid>
  );
};

export { GameInfoDetails };
