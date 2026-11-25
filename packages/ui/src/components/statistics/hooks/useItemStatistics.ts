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
import { createBatchLoader } from "#@/util/createBatchLoader";
import { ExtendedUseQueryResult } from "#@/util/types/ExtendedUseQueryResult";

export type StatisticsWithStatus = StatisticsSummaryDto & StatisticsStatusDto;

export interface InitialItemStatistics {
  likesCount: number;
  isLiked: boolean;
}

export type ItemStatisticsData = StatisticsWithStatus | InitialItemStatistics;

interface StatisticsBatchParams {
  sourceType: StatisticsSourceRequestDto.sourceType;
  /** Groups the batch per viewer; the server reads the viewer from the session. */
  actorKey: string;
}

async function findStatisticsWithStatus(
  sourceId: string | number,
  { sourceType, actorKey }: StatisticsBatchParams,
): Promise<StatisticsWithStatus> {
  const [summary, status] = await Promise.all([
    StatisticsService.statisticsControllerFindSummaryV1({
      sourceId,
      sourceType,
    }),
    // Signed out, the server answers `false` for both without a lookup
    // (the summary already validates the source), so skip the request.
    actorKey !== "anonymous"
      ? StatisticsService.statisticsControllerGetStatusV1(sourceType, sourceId)
      : { isLiked: false, isViewed: false },
  ]);
  return { ...summary, ...status };
}

/**
 * Every card in a list (reviews, activities, posts) reads its counts, likes
 * and comment count together: one `POST /v1/statistics/batch` replaces a
 * summary and a status request per card. Sources the batch leaves out (missing
 * or hidden) are read alone, so they keep the single read's 404/403.
 */
const loadStatistics = createBatchLoader<
  string | number,
  StatisticsWithStatus,
  StatisticsBatchParams
>({
  fetchMany: async (sourceIds, { sourceType }) => {
    const { items, ...freshness } =
      await StatisticsService.statisticsControllerFindBatchSummaryV1({
        sourceType,
        sourceIds,
      });
    return items.map((item) => ({
      ...freshness,
      ...item,
      sourceType: item.sourceType as StatisticsSummaryDto.sourceType,
    }));
  },
  fetchOne: findStatisticsWithStatus,
  getId: (item) => item.sourceId,
});

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
        return (await loadStatistics(canonicalId, {
          sourceType,
          actorKey,
        })) as ResultData;
      },
    }),
    invalidate,
    queryKey,
  };
}
