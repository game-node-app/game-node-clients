import { useOwnUserConnections } from "#@/components/connections/hooks/useOwnUserConnections";
import { getConnectionName } from "#@/components/connections/util/getConnectionName";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  formatUtcDate,
  useFormatLocale,
} from "#@/components/events/util/format";
import type { YearRecap } from "#@/components/recap/types";
import { useTranslation } from "@repo/locales";
import type { UserConnectionDto } from "@repo/wrapper/server";

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
      className={
        "flex flex-wrap items-center gap-x-2 gap-y-1 pt-10 pb-4 text-sm text-[#808080] md:pt-12"
      }
    >
      {start && end && (
        <span>{t("recap.page.footer.period", { start, end })}</span>
      )}
      {isOwner && <RecapConnectedSources />}
      {!recap.isFinal && (
        <>
          <span aria-hidden>·</span>
          <span>{t("recap.page.hero.updates")}</span>
        </>
      )}
    </footer>
  );
}

/**
 * Reads the owner's connections and lists their providers. Mounted only for the
 * owner: the read needs a session and a visitor cannot see them.
 */
function RecapConnectedSources() {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const connectionsQuery = useOwnUserConnections();

  if (!connectionsQuery.data || connectionsQuery.data.length === 0) {
    return null;
  }

  const names = Array.from(
    new Set(
      connectionsQuery.data.map((connection) =>
        getConnectionName(connection.type as unknown as UserConnectionDto.type),
      ),
    ),
  );
  const sources = new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  }).format(names);

  return (
    <>
      <span aria-hidden>·</span>
      <span data-testid={"recap-footer-sources"}>
        {t("recap.page.footer.sources", { sources })}
      </span>
    </>
  );
}
