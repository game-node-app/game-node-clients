import { ReactNode } from "react";
import { Paper, Text } from "@mantine/core";

interface Props {
  label: string;
  value: ReactNode;
}

/** A small dimmed label over a value, like the Info Card in the design system. */
const DailyInfoTile = ({ label, value }: Props) => (
  <Paper p={"sm"} radius={"md"} className={"bg-paper-2"}>
    <Text size={"xs"} c={"dimmed"}>
      {label}
    </Text>
    <Text fw={700}>{value}</Text>
  </Paper>
);

export { DailyInfoTile };
