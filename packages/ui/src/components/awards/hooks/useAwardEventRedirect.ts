import { useAwardEvent } from "#@/components/awards/hooks/useAwardEvent";
import { getAwardsScreenHref } from "#@/components/events/util/seasonEvents";
import { useRouter } from "#@/util";
import { useEffect } from "react";

/**
 * Sends `/awards/:year` to the screen of the server-computed `phase`
 * (spec: Destino por fase do Awards):
 *
 * - `upcoming`, `nominations` and `nominations_closed` → `/nominations`
 *   (read-only category list outside the nomination phase);
 * - `voting` and `voting_closed` → `/vote`;
 * - `results` → `/result`.
 */
export function useAwardEventRedirect(eventYear: number | undefined) {
  const router = useRouter();
  const { data: event } = useAwardEvent({ eventYear });

  useEffect(() => {
    if (!event) return;

    const target = getAwardsScreenHref(event.year, event.phase);
    const currentPath = router.asPath?.split(/[?#]/)[0];

    if (currentPath?.endsWith(target)) {
      return;
    }

    router.push(target, { replace: true }).catch(console.error);
  }, [event, router]);
}
