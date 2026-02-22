import React from "react";
import { Box, Flex, Stack, Text, Title } from "@mantine/core";
import { RecapYearTitle } from "#@/components/recap/RecapYearTitle";
import { RecapStatsCard } from "#@/components/recap/stats/RecapStatsCard";
import { useRecap } from "#@/components/recap/hooks/useRecap";
import { RecapStatsPlayedGames } from "#@/components/recap/stats/RecapStatsPlayedGames";
import { RecapStatsPlaytime } from "#@/components/recap/stats/RecapStatsPlaytime";
import { RecapGamePlaytimeCard } from "#@/components/recap/RecapGamePlaytimeCard";
import { RecapStatsChartsSection } from "#@/components/recap/stats/RecapStatsChartsSection";
import { RecapMiscStats } from "#@/components/recap/stats/RecapMiscStats";
import { useUserId } from "#@/components";

interface Props {
  userId: string;
  targetYear: number;
}

const RecapStatsScreen = ({ userId, targetYear }: Props) => {
  const { data: recap } = useRecap(userId, targetYear);
  const ownUserId = useUserId();
  const isOwnRecap = ownUserId === userId;
  const playedGames = recap?.playedGames || [];

  return (
    <Stack>
      <Flex className={"w-full justify-center mt-14 px-4 lg:px-0"}>
        <RecapYearTitle
          userId={userId}
          targetYear={targetYear}
          withShareButton
          withUserAvatar
        />
      </Flex>
      <RecapStatsCard className={"mt-24 p-4"}>
        <Flex className={"justify-center w-full gap-8"}>
          <RecapStatsPlayedGames userId={userId} targetYear={targetYear} />
          <RecapStatsPlaytime userId={userId} targetYear={targetYear} />
        </Flex>
        <Flex
          className={"w-full justify-center flex-wrap lg:flex-nowrap gap-3"}
        >
          {playedGames.slice(0, 3).map((playedGame) => (
            <Box key={playedGame.id} className={"w-full lg:w-4/12"}>
              <RecapGamePlaytimeCard playedGame={playedGame} />
            </Box>
          ))}
        </Flex>
      </RecapStatsCard>
      <RecapStatsCard className={"mt-8 p-4"}>
        <Stack className={"gap-3 mb-4 items-center text-center"}>
          <Title className={"text-3xl font-black"}>
            Graphs and more graphs
          </Title>
          <Text>Most played genres and styles</Text>
          <RecapStatsChartsSection userId={userId} targetYear={targetYear} />
        </Stack>
      </RecapStatsCard>
      <RecapStatsCard className={"mt-8 p-4"}>
        <RecapMiscStats userId={userId} targetYear={targetYear} />
      </RecapStatsCard>
      {isOwnRecap && (
        <Text className={"font-bold text-center"}>
          Thanks for choosing us this year.
        </Text>
      )}
    </Stack>
  );
};

export { RecapStatsScreen };
