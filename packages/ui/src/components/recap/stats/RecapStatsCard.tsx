import React from "react";
import { Stack, StackProps } from "@mantine/core";
import { cn } from "#@/util";

const RecapStatsCard = (props: StackProps) => {
  return (
    <Stack
      {...props}
      className={cn("bg-paper-5 rounded-md", props.className)}
    />
  );
};

export { RecapStatsCard };
