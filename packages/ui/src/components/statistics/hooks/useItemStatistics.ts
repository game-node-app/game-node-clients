import {
  ApiError,
  StatisticsService,
  StatisticsSourceRequestDto,
  StatisticsStatusDto,
  StatisticsSummaryDto,
} from "@repo/wrapper/server";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export type StatisticsWithStatus = StatisticsSummaryDto & StatisticsStatusDto;

export interface InitialItemStatistics {
  likesCount: number;
  isLiked: boolean;
}

export type ItemStatisticsData = StatisticsWithStatus | InitialItemStatistics;

const initialSeedClaims = new WeakMap<QueryClient, WeakMap<object, string>>();

function isValidInitialStatistics(
  value: InitialItemStatistics | null | undefined,
): value is InitialItemStatistics {
  return (
    value != null &&
    typeof value.likesCount === "number" &&
    Number.isFinite(value.likesCount) &&
    typeof value.isLiked === "boolean"
  );
}

export function useItemStatistics<
  TInitial extends InitialItemStatistics | undefined = undefined,
>(
  sourceId: string | number | undefined,
  sourceType: StatisticsSourceRequestDto.sourceType,
  initialStatistics?: TInitial,
): ExtendedUseQueryResult<
  [TInitial] extends [undefined] ? StatisticsWithStatus : ItemStatisticsData
> {
  const queryClient = useQueryClient();
  const actor = useUserId();
  const actorKey = actor ?? "anonymous";

  const gameId =
    typeof sourceId === "number" ||
    (typeof sourceId === "string" && /^\d+$/.test(sourceId))
      ? Number(sourceId)
      : NaN;
  const canonicalId =
    sourceType === StatisticsSourceRequestDto.sourceType.GAME
      ? Number.isSafeInteger(gameId) && gameId > 0
        ? gameId
        : undefined
      : typeof sourceId === "string" && sourceId
        ? sourceId
        : undefined;
  const queryKey = ["statistics", sourceType, canonicalId, actorKey];
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: queryKey.slice(0, 3) });
  };

  const hasValidInitial =
    sourceType === StatisticsSourceRequestDto.sourceType.ACTIVITY &&
    canonicalId !== undefined &&
    isValidInitialStatistics(initialStatistics);

  const [boundSeed, setBoundSeed] = useState<{
    sourceType: StatisticsSourceRequestDto.sourceType;
    canonicalId: string | number;
    actorKey: string;
  } | null>(() =>
    hasValidInitial && canonicalId !== undefined
      ? { sourceType, canonicalId, actorKey }
      : null,
  );

  let sameActorForSeed = true;
  if (hasValidInitial && canonicalId !== undefined) {
    if (
      boundSeed === null ||
      boundSeed.sourceType !== sourceType ||
      boundSeed.canonicalId !== canonicalId
    ) {
      setBoundSeed({ sourceType, canonicalId, actorKey });
    } else if (boundSeed.actorKey !== actorKey) {
      sameActorForSeed = false;
    }

    let clientClaims = initialSeedClaims.get(queryClient);
    if (!clientClaims) {
      clientClaims = new WeakMap<object, string>();
      initialSeedClaims.set(queryClient, clientClaims);
    }
    const claimedActor = clientClaims.get(initialStatistics);
    if (claimedActor === undefined) {
      if (sameActorForSeed) {
        clientClaims.set(initialStatistics, actorKey);
      }
    } else if (claimedActor !== actorKey) {
      sameActorForSeed = false;
    }
  } else if (boundSeed !== null) {
    setBoundSeed(null);
  }

  const canSeed = hasValidInitial && sameActorForSeed;

  type ResultData = [TInitial] extends [undefined]
    ? StatisticsWithStatus
    : ItemStatisticsData;

  return {
    ...useQuery<ResultData, ApiError>({
      queryKey,
      enabled: canonicalId !== undefined,
      initialData: canSeed
        ? () => {
            const existing = queryClient.getQueryCache().find({
              queryKey,
              exact: true,
            });
            if (
              existing &&
              (existing.state.data !== undefined ||
                existing.state.dataUpdateCount > 0 ||
                existing.state.errorUpdateCount > 0 ||
                existing.state.fetchStatus !== "idle")
            ) {
              return undefined;
            }
            return {
              likesCount: initialStatistics.likesCount,
              isLiked: initialStatistics.isLiked,
            } as ResultData;
          }
        : undefined,
      staleTime: canSeed ? Infinity : undefined,
      queryFn: async (): Promise<ResultData> => {
        if (canonicalId === undefined)
          throw new Error("Invalid statistics source");
        const [summary, status] = await Promise.all([
          StatisticsService.statisticsControllerFindSummaryV1({
            sourceId: canonicalId,
            sourceType,
          }),
          StatisticsService.statisticsControllerGetStatusV1(
            sourceType,
            canonicalId,
          ),
        ]);
        return { ...summary, ...status } as ResultData;
      },
    }),
    invalidate,
    queryKey,
  };
}
