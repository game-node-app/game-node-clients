import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  ProfileMetricsService,
  type ProfileMetricsSummaryResponseDto,
} from "@repo/wrapper/server";
import { useQuery } from "@tanstack/react-query";
import {
  buildMockRecapSummary,
  isMockRecap,
} from "#@/components/recap/hooks/mockRecap";

/** Rolling windows the recap card can show (last 7, 30 or 365 days). */
export type RecapPeriod = "week" | "month" | "year";

export const getRecapSummaryKey = (
  userId: string | undefined,
  period: RecapPeriod,
) => ["profile", "metrics", "summary", userId ?? null, period];

/**
 * Playtime summary behind the recap card: totals for the period and the
 * previous one, top games, genre and platform. The numbers move slowly, so
 * they stay fresh for a few minutes even where the app default is `Infinity`.
 */
export function useRecapSummary(period: RecapPeriod) {
  const userId = useUserId();

  return useQuery({
    queryKey: getRecapSummaryKey(userId, period),
    queryFn: () =>
      isMockRecap(userId)
        ? Promise.resolve(
            buildMockRecapSummary(
              period,
            ) as unknown as ProfileMetricsSummaryResponseDto,
          )
        : ProfileMetricsService.profileMetricsControllerGetPeriodSummaryV1(
            userId!,
            period,
          ),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
