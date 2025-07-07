import React from "react";
import { Box, Group, HoverCard, Popover, Skeleton, Text } from "@mantine/core";
import { useOnMobile } from "#@/components";
import { IconInfoCircle } from "@tabler/icons-react";

interface Props {
  title: string;
  // Rendered "N/A" if 0
  seconds: number;
  /**
   * Description show on title click (popover).
   */
  description: string;
  isLoading: boolean;
}

const GameInfoTimeToBeatItem = ({
  title,
  seconds,
  description,
  isLoading,
}: Props) => {
  const onMobile = useOnMobile();
  const renderedValue =
    seconds === 0 ? "N/A" : `${Math.ceil(seconds / 3600)} Hours`;

  const TargetDescriptionElement = onMobile ? Popover : HoverCard;

  return (
    <Group className={"gap-0.5 flex-nowrap w-full text-white"}>
      <TargetDescriptionElement openDelay={500}>
        <TargetDescriptionElement.Target>
          <Box
            className={
              "border-[#1F1F1F] border rounded-tl-md rounded-bl-md w-1/2 p-2 "
            }
          >
            <Group className={"gap-1 flex-nowrap w-full justify-center"}>
              <Text className={"text-center"}>{title}</Text>
              <IconInfoCircle size={12} />
            </Group>
          </Box>
        </TargetDescriptionElement.Target>
        <TargetDescriptionElement.Dropdown className={"max-w-40"}>
          <Text className={"text-sm text-wrap"}>{description}</Text>
        </TargetDescriptionElement.Dropdown>
      </TargetDescriptionElement>

      {isLoading ? (
        <Skeleton className={"w-1/2 h-10"} />
      ) : (
        <Box
          className={
            "border-[#1F1F1F] border rounded-tr-md rounded-br-md bg-brand-5 w-1/2 p-2"
          }
        >
          <Text className={"text-center"}>{renderedValue}</Text>
        </Box>
      )}
    </Group>
  );
};

export { GameInfoTimeToBeatItem };
