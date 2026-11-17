import { Divider, Group, Text, Title } from "@mantine/core";
import dayjs from "dayjs";

interface JournalYearHeaderProps {
  year: number;
  /**
   * Already-formatted subtitle, e.g. "12 games".
   */
  subtitle: string;
}

/**
 * Year heading used by the flattened (progressively rendered) journal lists.
 */
const JournalYearHeader = ({ year, subtitle }: JournalYearHeaderProps) => {
  return (
    <div>
      <Group className={"gap-3"}>
        <Title size={"h4"} fw={"bold"} className={"text-white"}>
          {year}
        </Title>
        <Text className={"text-sm text-dimmed"}>{subtitle}</Text>
      </Group>
      <Divider className={"w-full mt-2 mb-3"} />
    </div>
  );
};

interface JournalMonthHeaderProps {
  year: number;
  /**
   * Zero-based month index.
   */
  month: number;
}

const JournalMonthHeader = ({ year, month }: JournalMonthHeaderProps) => {
  return (
    <Title size={"h5"} className={"text-white mt-1"}>
      {dayjs(new Date(year, month, 1)).format("MMMM")}
    </Title>
  );
};

export { JournalYearHeader, JournalMonthHeader };
