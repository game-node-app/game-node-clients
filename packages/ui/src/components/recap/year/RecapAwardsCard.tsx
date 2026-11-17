import { useAwardEventCategories } from "#@/components/awards/hooks/useAwardEventCategories";
import { useAwardsBallot } from "#@/components/awards/hooks/useAwardsBallot";
import { useCurrentAwardsEvent } from "#@/components/awards/hooks/useCurrentAwardsEvent";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  formatNumber,
  useFormatLocale,
} from "#@/components/events/util/format";
import { getAwardsEntry } from "#@/components/events/util/seasonEvents";
import { Link } from "#@/util";
import { Button } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface RecapAwardsCardProps {
  year: number;
  /** Owner of the Recap. Visitors never see the ballot shortcut. */
  userId: string;
}

/**
 * Awards shortcut inside the Recap backlog (spec: Atalho para a cédula). It is
 * composed from the current event, the ballot and the categories, and only
 * exists for the signed-in owner while the same year is in `voting`.
 */
export function RecapAwardsCard({ year, userId }: RecapAwardsCardProps) {
  const { t } = useTranslation();
  const locale = useFormatLocale();
  const loggedUserId = useUserId();
  const currentEventQuery = useCurrentAwardsEvent();

  const event =
    currentEventQuery.data?.year === year ? currentEventQuery.data : null;
  const isOwner = !!loggedUserId && loggedUserId === userId;
  const isVoting = event?.phase === "voting";
  const enabled = isOwner && isVoting && event != null;

  const ballot = useAwardsBallot(enabled ? event.id : undefined);
  const categories = useAwardEventCategories(enabled ? event.id : undefined);

  if (!event || !enabled) return null;

  const entry = getAwardsEntry(event, ballot.data, categories.data, new Date());
  const gotyCategory = categories.data?.find((category) => category.isGOTY);
  const gotyBallotCategory = gotyCategory
    ? ballot.data?.categories.find(
        (category) => category.id === gotyCategory.id,
      )
    : undefined;
  const gotyTotals = gotyBallotCategory
    ? {
        played: gotyBallotCategory.playedNomineesCount,
        total: gotyBallotCategory.nominees.length,
      }
    : null;

  return (
    <div
      data-testid={"recap-awards-card"}
      className={
        "flex flex-col gap-5 rounded-2xl border border-brand bg-[#2b130e] p-5 md:p-8"
      }
    >
      <p
        className={
          "m-0 text-xs leading-none font-bold tracking-[0.06em] text-brand-3 uppercase"
        }
      >
        {t("recap.page.awards.title", { year })}
      </p>
      {gotyTotals && (
        <h3 className={"m-0 text-2xl leading-8 font-medium text-white"}>
          {t("recap.page.awards.played", {
            played: formatNumber(gotyTotals.played, locale) ?? "0",
            total: formatNumber(gotyTotals.total, locale) ?? "0",
          })}
        </h3>
      )}
      <p className={"m-0 text-base leading-normal text-[#adadad]"}>
        {t("recap.page.awards.note", { year })}
      </p>
      {entry && (
        <Button
          component={Link}
          href={entry.href}
          size={"md"}
          radius={"md"}
          className={"mt-auto self-end"}
        >
          {t("recap.page.awards.action")}
        </Button>
      )}
    </div>
  );
}
