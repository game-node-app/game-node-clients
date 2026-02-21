import React from "react";
import { Box, Group, Image, Stack, Text } from "@mantine/core";
import {
  YearRecapPlayedGame,
  YearRecapPlayedGameDto,
} from "@repo/wrapper/server";
import { getSizedImageUrl, ImageSize, useGame } from "#@/components";
import { getServerStoredIcon } from "#@/util";

interface Props {
  playedGame: YearRecapPlayedGameDto;
}

const RecapGamePlaytimeCard = ({ playedGame }: Props) => {
  const { data: game } = useGame(playedGame.gameId, {
    relations: {
      cover: true,
      artworks: true,
    },
  });

  const artworks = game?.artworks || [];
  const artworksUrls = artworks
    .map((artwork) => getSizedImageUrl(artwork.url, ImageSize.FULL_HD))
    .filter((url) => url != undefined);

  const targetUrl = artworksUrls.at(0);

  return (
    <Stack
      className={`w-full h-96 rounded-md`}
      style={{
        backgroundImage: `url(${targetUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Group
        className={
          "bg-[#212121] h-20 p-4 mt-auto justify-center relative text-white"
        }
      >
        <Image
          src={getServerStoredIcon(playedGame.platform!.iconName!)}
          className={"w-8 h-8 absolute top-7 left-3"}
        />
        <Stack className={"gap-1.5 text-center"}>
          <Text className={"line-clamp-1"}>{game?.name}</Text>
          <Text className={"font-bold"}>
            {playedGame.percentOfTotalPlaytimeFormatted}% of total playtime
          </Text>
        </Stack>
      </Group>
    </Stack>
  );
};

export { RecapGamePlaytimeCard };
