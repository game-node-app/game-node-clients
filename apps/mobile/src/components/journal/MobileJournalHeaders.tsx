import { Badge } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { JournalMonthHeaderProps, JournalYearHeaderProps } from "@repo/ui";

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
const MobileJournalMonthHeader = ({ year, month }: JournalMonthHeaderProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;

  return (
    <h3 className="m-0 px-1 pt-2 text-xs font-semibold uppercase tracking-wider text-dimmed-1">
      {new Intl.DateTimeFormat(locale, { month: "long" }).format(
        new Date(year, month, 1),
      )}
    </h3>
  );
};

export { MobileJournalYearHeader, MobileJournalMonthHeader };
