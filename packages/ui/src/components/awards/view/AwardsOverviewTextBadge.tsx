import React, { PropsWithChildren } from "react";
import { Box, Group, Text } from "@mantine/core";

const AwardsOverviewTextBadge = ({ children }: PropsWithChildren) => {
  return (
    <Group className={"w-fit flex-nowrap items-center gap-1.5"}>
      <Box className={"rounded bg-brand-5 w-2.5 h-8"} />
      <Text className={"text-white text-sm lg:text-lg"}>{children}</Text>
    </Group>
  );
};

export { AwardsOverviewTextBadge };
