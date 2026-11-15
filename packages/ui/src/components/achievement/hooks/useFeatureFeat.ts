import {
  createContext,
  createElement,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  useContext,
  useState,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AchievementsService,
  ObtainedAchievementDto,
} from "@repo/wrapper/server";
import { createErrorNotification } from "#@/util";

/** Prefix of every obtained-achievement cache created by `useAllObtainedAchievements`. */
const OBTAINED_ACHIEVEMENTS_KEY = ["achievement", "obtained", "all"];

interface FeaturedFeatOptimisticState {
  pendingAchievementId: string | null;
  setPendingAchievementId: Dispatch<SetStateAction<string | null>>;
}

const FeaturedFeatOptimisticContext =
  createContext<FeaturedFeatOptimisticState | null>(null);

/**
 * Shares the feat chosen while `useFeatureFeat` is in flight. The featured
 * cache only receives `ObtainedAchievementDto` rows the page already fetched,
 * and the client must not invent one, so the page keeps the pending choice
 * here and merges it with the server data until the refetch lands.
 */
export function FeaturedFeatOptimisticProvider({
  children,
}: PropsWithChildren) {
  const [pendingAchievementId, setPendingAchievementId] = useState<
    string | null
  >(null);

  return createElement(
    FeaturedFeatOptimisticContext.Provider,
    { value: { pendingAchievementId, setPendingAchievementId } },
    children,
  );
}

/** Feat chosen optimistically by the page owner, or null when none is pending. */
export function useOptimisticFeaturedAchievementId() {
  return (
    useContext(FeaturedFeatOptimisticContext)?.pendingAchievementId ?? null
  );
}

interface FeatureFeatContext {
  previous: [readonly unknown[], ObtainedAchievementDto[] | undefined][];
}

/**
 * Makes one obtained feat the only featured feat of the user.
 *
 * The mutation sends a single id, so the server unfeatures every other feat.
 * Caches are updated optimistically according to their own filter: the
 * unfiltered list flips every flag, the featured list keeps only the chosen
 * row and the non-featured list drops it. A first-time featured feat has no
 * row in the featured cache yet, so the page reads it from the shared pending
 * state instead of copying or inventing an `ObtainedAchievementDto`.
 */
export function useFeatureFeat(targetUserId: string) {
  const queryClient = useQueryClient();
  const optimistic = useContext(FeaturedFeatOptimisticContext);
  const obtainedAchievementsKey = [...OBTAINED_ACHIEVEMENTS_KEY, targetUserId];

  return useMutation<void, Error, string, FeatureFeatContext>({
    mutationFn: async (achievementId) => {
      await AchievementsService.achievementsV2ControllerUpdateFeaturedObtainedAchievementsV2(
        {
          featuredAchievementIds: [achievementId],
        },
      );
    },
    onMutate: async (achievementId) => {
      optimistic?.setPendingAchievementId(achievementId);

      await queryClient.cancelQueries({ queryKey: obtainedAchievementsKey });

      const previous = queryClient.getQueriesData<ObtainedAchievementDto[]>({
        queryKey: obtainedAchievementsKey,
      });

      for (const [queryKey, data] of previous) {
        if (data == undefined) continue;

        // `useAllObtainedAchievements` puts the `isFeatured` filter after the
        // target user id and the order.
        const isFeaturedFilter = queryKey[OBTAINED_ACHIEVEMENTS_KEY.length + 2];

        let next: ObtainedAchievementDto[];
        if (isFeaturedFilter === true) {
          next = data
            .filter((obtained) => obtained.achievementId === achievementId)
            .map((obtained) => ({ ...obtained, isFeatured: true }));
        } else if (isFeaturedFilter === false) {
          next = data
            .filter((obtained) => obtained.achievementId !== achievementId)
            .map((obtained) => ({ ...obtained, isFeatured: false }));
        } else {
          next = data.map((obtained) => ({
            ...obtained,
            isFeatured: obtained.achievementId === achievementId,
          }));
        }

        queryClient.setQueryData(queryKey, next);
      }

      return { previous };
    },
    onError: (error, achievementId, context) => {
      for (const [queryKey, data] of context?.previous ?? []) {
        queryClient.setQueryData(queryKey, data);
      }

      optimistic?.setPendingAchievementId((current) =>
        current === achievementId ? null : current,
      );
      createErrorNotification(error);
    },
    onSettled: async (_data, _error, achievementId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: OBTAINED_ACHIEVEMENTS_KEY,
        }),
        queryClient.invalidateQueries({
          queryKey: ["userProfile", targetUserId],
        }),
      ]);

      // Keep the optimistic choice until the refetch lands so the slot does
      // not flash empty between the response and the refreshed cache.
      optimistic?.setPendingAchievementId((current) =>
        current === achievementId ? null : current,
      );
    },
  });
}
