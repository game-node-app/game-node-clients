import React from "react";
import { getServerStoredIcon } from "#@/util/getServerStoredImages";
import { Box, Flex, Image, ImageProps } from "@mantine/core";

interface Props extends ImageProps {
  achievementId: string;
}

const AchievementLogo = ({ achievementId, ...others }: Props) => {
  return (
    <Flex className={"w-14 min-w-14 justify-center"}>
      <Image
        className="w-[48px] h-[48px] object-contain"
        src={getServerStoredIcon(achievementId)}
        alt={achievementId}
        height={48}
        width={48}
        {...others}
      />
    </Flex>
  );
};

export { AchievementLogo };
