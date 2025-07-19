import React from "react";
import {
  GameAchievementDto,
  GameAchievementWithObtainedInfo,
} from "@repo/wrapper/server";
import { useOnMobile } from "#@/components";
import { HoverCard, Image, Popover, Stack, Text, Title } from "@mantine/core";
import dayjs from "dayjs";

interface Props {
  achievement: GameAchievementWithObtainedInfo;
}

const GameAchievementHoverIcon = ({ achievement }: Props) => {
  const onMobile = useOnMobile();
  const TargetElement = onMobile ? Popover : HoverCard;

  return (
    <TargetElement openDelay={500}>
      <TargetElement.Target>
        <Image
          src={achievement.iconUrl}
          alt={achievement.name}
          className={"w-12 h-12"}
        />
      </TargetElement.Target>
      <TargetElement.Dropdown className={"max-w-60 lg:max-w-96"}>
        <Stack>
          <Title order={5}>{achievement.name}</Title>
          <Text className={"text-dimmed"}>{achievement.description}</Text>
          {achievement.isObtained && (
            <Text className={"mt-2 text-dimmed text-sm"}>
              Obtained at {dayjs(achievement.obtainedAt).format("LLL")}
            </Text>
          )}
        </Stack>
      </TargetElement.Dropdown>
    </TargetElement>
  );
};

export { GameAchievementHoverIcon };
