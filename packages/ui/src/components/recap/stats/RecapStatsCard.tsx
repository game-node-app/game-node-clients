import { cn } from "#@/util";
import { Stack, StackProps } from "@mantine/core";

const RecapStatsCard = (props: StackProps) => {
  return (
    <Stack
      {...props}
      className={cn("bg-paper-5 rounded-md", props.className)}
    />
  );
};

export { RecapStatsCard };