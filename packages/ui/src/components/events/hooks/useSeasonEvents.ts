import { useUserId } from "#@/components/auth/hooks/useUserId";
import type {
  AwardsBallot,
  CurrentAwardsEvent,
} from "#@/components/awards/types";
import { useAwardsBallot } from "#@/components/awards/hooks/useAwardsBallot";
import { useAwardEventCategories } from "#@/components/awards/hooks/useAwardEventCategories";
import { useCurrentAwardsEvent } from "#@/components/awards/hooks/useCurrentAwardsEvent";
import { useCurrentRecapWindow } from "#@/components/recap/hooks/useCurrentRecapWindow";
import { useRecapStatus } from "#@/components/recap/hooks/useRecapStatus";
import type { RecapCurrent, RecapStatus } from "#@/components/recap/types";
import type { VotableAwardsCategoryDto } from "@repo/wrapper/server";
import type {
  AwardsEntry,
  RecapEntry,
} from "#@/components/events/util/seasonEvents";
import {
  getAwardsEntry,
  getRecapEntry,
} from "#@/components/events/util/seasonEvents";

/** The season entries plus the reads Home, Dock and the mobile menu share. */
export interface SeasonEvents {
  userId: string | undefined;
  awardsEvent: CurrentAwardsEvent | null;
  awardsEntry: AwardsEntry | null;
  /** The signed-in user's ballot; only read in the voting phase. */
  awardsBallot: AwardsBallot | undefined;
  /** Categories of the current event; only read in the voting phase. */
  awardsCategories: VotableAwardsCategoryDto[] | undefined;
  recapWindow: RecapCurrent | undefined;
  /** `null` without a session or before the status read resolves. */
  recapStatus: RecapStatus | null;
  recapEntry: RecapEntry | null;
  recapYear: number | null;
  /**
   * `/recap/{year}/{userId}` for the signed-in user. `null` for visitors, so
   * Dock and menu use it as the gate of the personalized Recap entry.
   */
  recapHref: string | null;
  /** True while the reads that decide the entries are still resolving. */
  isLoading: boolean;
}

/**
 * Composes the season reads (design §3: "Home, Dock e menu mobile só leem esse
 * hook"):
 * - `events/current` (public) always;
 * - `recap/current` (public) always;
 * - the Recap status for the window year only with a session;
 * - the ballot only with a session **and** the `voting` phase;
 * - the categories only in `voting`, where the Home card needs the global GOTY
 *   flag/name (`CATEGORIES` in the appendix read map).
 */
export function useSeasonEvents(): SeasonEvents {
  const userId = useUserId();

  const awardsEventQuery = useCurrentAwardsEvent();
  const awardsEvent = awardsEventQuery.data ?? null;
  const votingEventId =
    awardsEvent?.phase === "voting" ? awardsEvent.id : undefined;

  const ballot = useAwardsBallot(votingEventId);
  const categories = useAwardEventCategories(votingEventId);

  const recapWindowQuery = useCurrentRecapWindow();
  const recapWindow = recapWindowQuery.data;
  const recapStatusQuery = useRecapStatus(userId, recapWindow?.year);

  const now = new Date();
  const awardsEntry = getAwardsEntry(
    awardsEvent,
    ballot.data,
    categories.data,
    now,
  );

  // `null` means "visitor" for the pure function, which is what enables the
  // live Recap teaser; a signed-in user's status stays `undefined` while it
  // loads so the Home does not flash a teaser.
  const recapStatusForEntry = userId ? recapStatusQuery.data : null;
  const recapEntry = getRecapEntry(recapWindow, recapStatusForEntry, now);

  return {
    userId,
    awardsEvent,
    awardsEntry,
    awardsBallot: ballot.data,
    awardsCategories: categories.data,
    recapWindow,
    recapStatus: recapStatusQuery.data ?? null,
    recapEntry,
    recapYear: recapWindow?.year ?? null,
    recapHref:
      userId && recapEntry ? `/recap/${recapEntry.year}/${userId}` : null,
    isLoading:
      awardsEventQuery.isPending ||
      recapWindowQuery.isPending ||
      (!!userId && recapStatusQuery.isPending),
  };
}
