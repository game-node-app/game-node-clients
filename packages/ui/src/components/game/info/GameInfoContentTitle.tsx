import React, { PropsWithChildren } from "react";
import {
  ActionIcon,
  ActionIconProps,
  Group,
  Title,
  TitleProps,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

interface Props extends PropsWithChildren {
  title: string;
  onGoBack: () => void;
  iconProps?: ActionIconProps;
  titleProps?: TitleProps;
}

const GameInfoContentTitle = ({
  title,
  onGoBack,
  iconProps,
  titleProps,
}: Props) => {
  return (
    <Group gap={"xs"} className={"flex-nowrap"}>
      <ActionIcon
        variant={"subtle"}
        size={"lg"}
        onClick={onGoBack}
        {...iconProps}
      >
        <IconArrowLeft />
      </ActionIcon>
      <Title size={"h2"} {...titleProps}>
        {title}
      </Title>
    </Group>
  );
};

export { GameInfoContentTitle };
