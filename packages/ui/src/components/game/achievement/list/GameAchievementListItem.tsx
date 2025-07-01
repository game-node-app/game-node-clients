import React from "react";
import { GameAchievementWithObtainedInfo } from "#@/components";
import {
  AspectRatio,
  Box,
  Group,
  Image,
  Overlay,
  Stack,
  Text,
} from "@mantine/core";

interface Props {
  achievement: GameAchievementWithObtainedInfo;
}

const GameAchievementListItem = ({ achievement }: Props) => {
  return (
    <Group className={"w-full"}>
      <Box className={"w-full lg:w-fit"}>
        <AspectRatio ratio={1} className={"relative w-12 h-12"}>
          <Image
            className={"w-full h-full"}
            src={achievement.iconUrl}
            alt={achievement.name}
          ></Image>
          {!achievement.isObtained && (
            <Overlay className={"z-0"} color="#000" backgroundOpacity={0.65} />
          )}
        </AspectRatio>
      </Box>

      <Stack className={"grow gap-1"}>
        <Text>{achievement.name}</Text>
        <Text className={"text-dimmed"}>{achievement.description}</Text>
      </Stack>
    </Group>
  );
};

export { GameAchievementListItem };
