import React from "react";
import { BaseRecapStatsProps } from "#@/components/recap/stats/types";
import { useRecap } from "#@/components/recap/hooks/useRecap";
import { Group, HoverCard, Popover, Stack, Text, Title } from "@mantine/core";
import { RecapPlatformCount } from "#@/components/recap/RecapPlatformCount";
import { useOnMobile } from "#@/components";

const RecapStatsPlayedGames = ({ userId, targetYear }: BaseRecapStatsProps) => {
  const onMobile = useOnMobile();
  const TooltipWrapper = onMobile ? Popover : HoverCard;
  const { data: recap } = useRecap(userId, targetYear);

  const totalPlayedGames = recap?.totalPlayedGames || 0;
  const playedByPlatform = recap?.playedGamesByPlatform.slice(0, 3) || [];

  return (
    <TooltipWrapper>
      <TooltipWrapper.Target>
        <Group className={"gap-2"}>
          <Stack className={"items-center gap-1"}>
            <Title className={"text-8xl font-black text-white"}>
              {totalPlayedGames}
            </Title>
            <Text>Played Games</Text>
          </Stack>
          <Stack className={"gap-1"}>
            {playedByPlatform.map((platform) => (
              <RecapPlatformCount platform={platform} key={platform.id} />
            ))}
          </Stack>
        </Group>
      </TooltipWrapper.Target>
      <TooltipWrapper.Dropdown className={"max-w-60 lg:max-w-96"}>
        <Text>
          Based on data received from connected platforms and
          played/finished/dropped dates in library items.
        </Text>
      </TooltipWrapper.Dropdown>
    </TooltipWrapper>
  );
};

export { RecapStatsPlayedGames };
