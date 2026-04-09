import React from "react";
import { Group, Stack, Text } from "@mantine/core";
import { useAccumulatedPlaytimeForGame, useUserId } from "#@/components";
import { IconClock } from "@tabler/icons-react";

interface Props {
  gameId: number;
}

const GameInfoSharePlaytime = ({ gameId }: Props) => {
  const userId = useUserId();
  const { data: playtime } = useAccumulatedPlaytimeForGame(userId, gameId);
  const playtimeInHours = playtime
    ? Math.ceil(playtime.totalPlaytimeSeconds / 3600)
    : 0;

  return (
    <Stack className={"gap-1"}>
      <Text>Playtime</Text>
      <Group className={"gap-1"}>
        <IconClock size={16} />
        <Text size={"sm"}>{playtimeInHours}h</Text>
      </Group>
    </Stack>
  );
};

export { GameInfoSharePlaytime };
