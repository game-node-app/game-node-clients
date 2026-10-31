import { GameFigureImage, useOnMobile } from "#@/components";
import { cn } from "#@/util";
import { Box, Flex, HoverCard, Popover, Stack, Text } from "@mantine/core";
import { Game } from "@repo/wrapper/server";
import { IconTrophyFilled } from "@tabler/icons-react";

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

  const color =
    colorClasses[position as keyof typeof colorClasses] || "text-gray-600";

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

      <Flex className={"mt-auto gap-1"}>
        <IconTrophyFilled className={cn(color)} />
        <Box className={cn(color)}>{position}</Box>
      </Flex>
    </Stack>
  );
};

export { AwardsResultGameFigure };
