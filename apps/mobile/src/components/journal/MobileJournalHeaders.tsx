import { Badge } from "@mantine/core";
import { JournalMonthHeaderProps, JournalYearHeaderProps } from "@repo/ui";
import dayjs from "dayjs";

/** Big year with a games-count chip. */
const MobileJournalYearHeader = ({
  year,
  subtitle,
}: JournalYearHeaderProps) => (
  <div className="flex items-center justify-between gap-3 pt-3">
    <h2 className="m-0 text-3xl font-bold leading-none text-white">{year}</h2>
    <Badge size="md" variant="light" color="gray">
      {subtitle}
    </Badge>
  </div>
);

/** Small caption for a month. */
const MobileJournalMonthHeader = ({ year, month }: JournalMonthHeaderProps) => (
  <h3 className="m-0 px-1 pt-2 text-xs font-semibold uppercase tracking-wider text-dimmed-1">
    {dayjs(new Date(year, month, 1)).format("MMMM")}
  </h3>
);

export { MobileJournalYearHeader, MobileJournalMonthHeader };
