import React from "react";
import {
  CollectionEntryEditModal,
  GameFigureImage,
  SearchGame,
  useRouter,
} from "@repo/ui";
import { Spotlight } from "@mantine/spotlight";
import { Box, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { useI18nContext } from "@repo/locales";
import { CommandCenterGameActionMenu } from "@/components/general/shell/command-center/action/CommandCenterGameActionMenu";

interface Props {
  game: SearchGame;
}

const CommandCenterGameAction = ({ game }: Props) => {
  const router = useRouter();
  const { language } = useI18nContext();
  const dtf = new Intl.DateTimeFormat(language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Spotlight.Action
      closeSpotlightOnTrigger={true}
      onClick={() => {
        console.log("Selected game: ", game.id);
        router.push(`/game/${game.id}`);
      }}
    >
      <Group className={"w-full flex-nowrap"}>
        <Box className={"h-auto w-1/6 lg:w-1/12"}>
          <GameFigureImage game={game} />
        </Box>
        <Stack className={"w-8/12"}>
          <Title size="h5" className="font-bold line-clamp-1">
            {game.name}
          </Title>
          {game.firstReleaseDate && (
            <Text size="sm" className="text-dimmed">
              {dtf.format(new Date(game.firstReleaseDate))}
            </Text>
          )}
        </Stack>
        <Flex
          className={"flex-grow justify-end"}
          onClick={(evt) => evt.stopPropagation()}
        >
          <CommandCenterGameActionMenu game={game} />
        </Flex>
      </Group>
    </Spotlight.Action>
  );
};

export { CommandCenterGameAction };
