import React, { PropsWithChildren } from "react";
import { ActionIcon, Group, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

interface Props extends PropsWithChildren {
  title: string;
  onGoBack?: () => void;
}

const GameInfoContentTitle = ({ title, onGoBack }: Props) => {
  return (
    <Group gap={"xs"}>
      <ActionIcon variant={"subtle"} size={"lg"} onClick={onGoBack}>
        <IconArrowLeft />
      </ActionIcon>
      <Title size={"h2"}>{title}</Title>
    </Group>
  );
};

export { GameInfoContentTitle };
