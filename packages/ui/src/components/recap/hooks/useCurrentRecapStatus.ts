import { useMemo } from "react";
import dayjs from "dayjs";
import { useRecapStatus } from "#@/components";

export function useCurrentRecapStatus(userId: string | undefined) {
  const targetYear = useMemo(() => {
    const now = dayjs();
    if (now.month() < 11) {
      return now.year() - 1;
    }

    return now.year();
  }, []);

  const { data: status } = useRecapStatus(userId, targetYear);

  return {
    isRecapCreated: status?.isRecapCreated || false,
    isRecapEligible: status?.isRecapEligible || false,
    targetYear: targetYear,
  };
}
