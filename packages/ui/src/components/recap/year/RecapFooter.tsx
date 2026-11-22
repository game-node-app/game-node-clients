import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import { RecapStoreSync } from "#@/components/recap/RecapStoreSync";
import type { YearRecap } from "#@/components/recap/types";
import { useTranslation } from "@repo/locales";

export interface RecapFooterProps {
  year: number;
  recap: YearRecap;
  userId: string;
}

/**
 * Recap footer (frame 5420:945): covered period, the owner's connected sources
 * and, while the year is live, the daily update note. The Recap read is public,
 * so a visitor sees the period without the source list.
 */
export function RecapFooter({ year, recap, userId }: RecapFooterProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const loggedUserId = useUserId();
  const isOwner = !!loggedUserId && loggedUserId === userId;

  const periodStart = new Date(Date.UTC(year, 0, 1));
  const periodEnd = recap.isFinal
    ? new Date(Date.UTC(year, 11, 31))
    : new Date(recap.updatedAt);
  const start = formatUtcDate(periodStart, locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const end = formatUtcDate(periodEnd, locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <footer
      data-testid={"recap-footer"}
      className={"flex flex-col gap-3 pt-10 pb-4 md:pt-12"}
    >
      <div
        className={
          "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted"
        }
      >
        {start && end && (
          <span>{t("recap.page.footer.period", { start, end })}</span>
        )}
        {!recap.isFinal && (
          <>
            {start && end && <span aria-hidden>·</span>}
            <span>{t("recap.page.hero.updates")}</span>
          </>
        )}
      </div>
      {isOwner && <RecapStoreSync />}
    </footer>
  );
}
