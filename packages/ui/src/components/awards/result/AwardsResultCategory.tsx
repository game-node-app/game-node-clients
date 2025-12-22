import React, { useMemo } from "react";
import { AwardsCategoryResult } from "@repo/wrapper/server";
import { useGames, useOnMobile } from "#@/components";
import { Box, Flex, Stack, Title } from "@mantine/core";
import { AwardsResultGameFigure } from "#@/components/awards/result/AwardsResultGameFigure";

interface Props {
  result: AwardsCategoryResult;
}

const AwardsResultCategory = ({ result }: Props) => {
  const onMobile = useOnMobile();
  const category = result.category;
  const gameIds = result.winners.map((winner) => winner.gameId).slice(0, 5);
  const gamesQuery = useGames({
    gameIds,
    relations: {
      cover: true,
    },
  });

  const winnersWithGameInfo = useMemo(() => {
    return (
      result.winners
        .map((winner) => {
          const game = gamesQuery.data?.find((g) => g.id === winner.gameId);
          if (!game) return undefined;
          return {
            ...winner,
            game,
          };
        })
        .filter((winner) => winner != undefined)
        // Reorder in a way that the first place is at the middle, second and third places to the sides
        .sort((a, b) => {
          if (onMobile) {
            return a!.position - b!.position;
          }
          const positionOrder = [4, 2, 1, 3, 5];
          return (
            positionOrder.indexOf(a!.position) -
            positionOrder.indexOf(b!.position)
          );
        })
    );
  }, [gamesQuery.data, onMobile, result.winners]);

  return (
    <Stack className={"items-center p-4 bg-paper-3 mobile:bg-paper-2"}>
      <Title size={"h4"} className={"mb-3"}>
        {category.name}
      </Title>
      <Flex className={"w-full justify-center gap-6 flex-wrap"}>
        {winnersWithGameInfo.map((winner) => (
          <AwardsResultGameFigure
            key={winner!.id}
            game={winner!.game}
            position={winner!.position}
            totalVotesPercentage={winner!.votesPercentage}
          />
        ))}
      </Flex>
    </Stack>
  );
};

export { AwardsResultCategory };
