import dayjs from "dayjs";
import { useAwardEvent } from "#@/components";

interface UseRunningAwardEventResult {
  isRunningEvent: boolean;
  isVotingPeriod: boolean;
  isResultsPeriod: boolean;
  eventYear: number | null;
  eventId: number | null;
}

export function useRunningAwardEvent(): UseRunningAwardEventResult {
  const now = dayjs();

  const targetYear = now.month() >= 9 ? now.year() : now.year() - 1;

  const awardQuery = useAwardEvent({ eventYear: targetYear });

  const isVotingPeriod = awardQuery.data
    ? now.isAfter(dayjs(awardQuery.data.votingStartDate)) &&
      now.isBefore(dayjs(awardQuery.data.votingEndDate))
    : false;

  const isResultsPeriod = awardQuery.data
    ? now.isAfter(dayjs(awardQuery.data.resultsDate)) &&
      now.isBefore(dayjs(awardQuery.data.resultsDate).add(1, "month"))
    : false;

  const isRunningEvent = isVotingPeriod || isResultsPeriod;

  return {
    isRunningEvent,
    isResultsPeriod,
    isVotingPeriod,
    eventYear: isRunningEvent ? targetYear : null,
    eventId: isRunningEvent && awardQuery.data ? awardQuery.data.id : null,
  };
}
