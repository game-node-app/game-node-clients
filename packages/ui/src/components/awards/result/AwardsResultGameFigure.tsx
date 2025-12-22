import React from "react";
import { AwardsCategoryResultWinner, Game } from "@repo/wrapper/server";
import { GameFigureImage, useOnMobile } from "#@/components";
import { Box, Flex, HoverCard, Popover, Stack, Text } from "@mantine/core";
import { IconTrophyFilled } from "@tabler/icons-react";
import { cn } from "#@/util";

interface Props {
  game: Game;
  position: number;
  totalVotesPercentage: number;
}

const AwardsResultGameFigure = ({
  game,
  position,
  totalVotesPercentage,
}: Props) => {
  const onMobile = useOnMobile();
  const colorClasses = {
    1: "text-yellow-400",
    2: "text-gray-400",
    3: "text-yellow-800",
  };
  const scaleClasses = {
    1: "scale-115",
    2: "scale-105",
    3: "scale-100",
  };

  const color =
    colorClasses[position as keyof typeof colorClasses] || "text-gray-600";
  const scale =
    scaleClasses[position as keyof typeof scaleClasses] || "scale-95";

  const DescriptionElement = onMobile ? Popover : HoverCard;

  return (
    <Stack className={cn("items-center relative")}>
      <DescriptionElement offset={20} width={200} withArrow>
        <DescriptionElement.Target>
          <Box
            className={cn("w-32 max-w-32 h-fit scale-100", {
              "lg:scale-125 lg:mb-4 lg:mx-2": position === 1,
              "lg:scale-105 lg:mb-1": position === 2 || position === 3,
            })}
          >
            <GameFigureImage
              game={game}
              onClick={(evt) => evt.preventDefault()}
            ></GameFigureImage>
          </Box>
        </DescriptionElement.Target>
        <DescriptionElement.Dropdown>
          <Text className={"text-sm"}>
            {game.name} received{" "}
            <span className={"font-bold"}>{totalVotesPercentage * 100}%</span>{" "}
            of total votes for this category.
          </Text>
        </DescriptionElement.Dropdown>
      </DescriptionElement>

      <Flex className={"mt-auto"}>
        <IconTrophyFilled className={cn(color)} />
        <Box className={cn(color)}>{position}</Box>
      </Flex>
    </Stack>
  );
};

export { AwardsResultGameFigure };
