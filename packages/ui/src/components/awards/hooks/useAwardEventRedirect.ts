import { useAwardEvent } from "#@/components";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useRouter } from "#@/util";

export function useAwardEventRedirect(eventYear: number | undefined) {
  const router = useRouter();
  const { data: event } = useAwardEvent({ eventYear });
  useEffect(() => {
    if (!eventYear || !event) return;
    const now = dayjs();
    const isVotingPeriod =
      now.isAfter(dayjs(event.votingStartDate)) &&
      now.isBefore(dayjs(event.votingEndDate));
    const isResultsPeriod = now.isAfter(dayjs(event.resultsDate));
    if (isVotingPeriod) {
      router
        .push(`/awards/${eventYear}/vote`, { replace: true })
        .catch(console.error);
    } else if (isResultsPeriod) {
      router
        .push(`/awards/${eventYear}/result`, { replace: true })
        .catch(console.error);
    }
  }, [event, eventYear, router]);
}
