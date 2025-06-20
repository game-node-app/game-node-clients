import React from "react";
import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import { AchievementDto } from "@repo/wrapper/server";
import { getServerStoredIcon } from "#@/util";
import { AchievementLogo } from "#@/components";
import { useObtainedAchievement } from "./hooks";

interface Props {
  targetUserId: string;
  achievement: AchievementDto | undefined;
}

const AchievementItem = ({ targetUserId, achievement }: Props) => {
  const obtainedAchievementQuery = useObtainedAchievement(
    targetUserId,
    achievement?.id,
  );
  if (!achievement) {
    return null;
  }
  const obtainedAchievement = obtainedAchievementQuery.data;
  const achievementNotYetObtained = obtainedAchievement == undefined;

  const obtainedText = achievementNotYetObtained
    ? "Not yet obtained"
    : `Obtained at ${new Date(obtainedAchievement?.createdAt).toLocaleDateString()}`;

  return (
    <Paper
      className={
        "border-[#282828] bg-paper data-[obtained=true]:bg-[#222222] border-2 rounded-md"
      }
      w={"100%"}
      withBorder
      pos={"relative"}
      data-obtained={obtainedAchievement ? "true" : "false"}
    >
      <Group
        wrap={"nowrap"}
        w={"100%"}
        h={"100%"}
        px={"1rem"}
        py={"1.5rem"}
        opacity={achievementNotYetObtained ? "0.80" : "1"}
      >
        <AchievementLogo achievementId={achievement.id} />
        <Stack gap={"0.5rem"}>
          <Title fz={"1rem"}>{achievement.name}</Title>
          <Text fz={"0.85rem"} className={"break-words"}>
            {achievement.description}
          </Text>
        </Stack>
        <Stack
          ml={"auto"}
          gap={0}
          justify={"center"}
          align={"center"}
          className={"w-24 min-w-24"}
        >
          <Title fz={"1.5rem"} className={"break-keep text-center"}>
            {achievement.expGainAmount} XP
          </Title>
          <Text className={"text-center text-xs"}>{obtainedText}</Text>
        </Stack>
      </Group>
    </Paper>
  );
};

export { AchievementItem };
