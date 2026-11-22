import { Badge } from "@mantine/core";
import {
  JournalMonthHeaderProps,
  JournalYearHeaderProps,
  useJournalMonthName,
} from "@repo/ui";

/** Big year with a games-count chip. */
const MobileJournalYearHeader = ({
  year,
  subtitle,
}: JournalYearHeaderProps) => (
  <div className="flex items-center justify-between gap-3 pt-3">
    <h2 className="m-0 text-3xl font-bold leading-none text-foreground">
      {year}
    </h2>
    <Badge size="md" variant="light" color="gray">
      {subtitle}
    </Badge>
  </div>
);

/** Small caption for a month. */
const MobileJournalMonthHeader = ({ year, month }: JournalMonthHeaderProps) => {
  const monthName = useJournalMonthName(year, month);

  return (
    <h3 className="m-0 px-1 pt-2 text-xs font-semibold uppercase tracking-wider text-dimmed-1">
      {monthName}
    </h3>
  );
};

export { MobileJournalYearHeader, MobileJournalMonthHeader };
