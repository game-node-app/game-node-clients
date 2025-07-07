import React from "react";
import { Box, Group, Text } from "@mantine/core";

interface Props {
  title: string;
  // Rendered "N/A" if 0
  seconds: number;
}

const GameInfoTimeToBeatItem = ({ title, seconds }: Props) => {
  const renderedValue =
    seconds === 0 ? "N/A" : `${Math.ceil(seconds / 3600)} Hours`;
  return (
    <Group className={"gap-0.5 flex-nowrap w-full text-white"}>
      <Box
        className={
          "border-[#1F1F1F] border rounded-tl-md rounded-bl-md w-1/2 p-2 "
        }
      >
        <Text className={"text-center"}>{title}</Text>
      </Box>
      <Box
        className={
          "border-[#1F1F1F] border rounded-tr-md rounded-br-md bg-brand-5 w-1/2 p-2"
        }
      >
        <Text className={"text-center"}>{renderedValue}</Text>
      </Box>
    </Group>
  );
};

export { GameInfoTimeToBeatItem };
