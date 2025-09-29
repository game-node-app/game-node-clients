import React from "react";
import { Group, Title } from "@mantine/core";
import { GameNodeLogo } from "#@/components";
import { cn } from "#@/util";

interface Props {
  logoProps?: React.ComponentProps<typeof GameNodeLogo>;
  titleProps?: React.ComponentProps<typeof Title>;
}

const AwardsEventLogo = ({ logoProps, titleProps }: Props) => {
  return (
    <Group className={"flex-nowrap gap-3 w-fit"}>
      <GameNodeLogo
        {...logoProps}
        className={cn(`h-8 @lg:h-10 w-auto`, logoProps?.className)}
      />
      <Title
        {...titleProps}
        className={cn("text-white text-2xl lg:text-3xl", titleProps?.className)}
      >
        AWARDS
      </Title>
    </Group>
  );
};

export { AwardsEventLogo };
