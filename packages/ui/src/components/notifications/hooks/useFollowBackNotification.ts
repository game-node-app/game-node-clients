import { useUserId } from "#@/components/auth/hooks/useUserId";
import { NOTIFICATIONS_AGGREGATED_QUERY_KEY } from "#@/components/notifications/hooks/useInfiniteAggregatedNotifications";
import { createErrorNotification } from "#@/util/createErrorNotification";
import { FollowService, NotificationsResponseDto } from "@repo/wrapper/server";
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

type NotificationsInfiniteData = InfiniteData<NotificationsResponseDto>;

function isNotificationsInfiniteData(
  value: unknown,
): value is NotificationsInfiniteData {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { pages?: unknown }).pages)
  );
}

/**
 * "Follow back" action of a notification. Optimistically flips
 * `isFollowedByRecipient` for that actor in every inbox query (so the button
 * disappears from all items of that actor) and keeps the follow status fresh.
 */
export function useFollowBackNotification() {
  const ownUserId = useUserId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (actorUserId: string) => {
      return FollowService.followControllerRegisterFollowV1({
        followedUserId: actorUserId,
      });
    },
    onMutate: async (actorUserId) => {
      await queryClient.cancelQueries({
        queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY,
      });
      const snapshots = queryClient.getQueriesData<unknown>({
        queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY,
      });

      queryClient.setQueriesData<unknown>(
        { queryKey: NOTIFICATIONS_AGGREGATED_QUERY_KEY },
        (data: unknown) => {
          if (!isNotificationsInfiniteData(data)) return data;

          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              data: page.data.map((item) => ({
                ...item,
                actors: item.actors.map((actor) =>
                  actor.userId === actorUserId
                    ? { ...actor, isFollowedByRecipient: true }
                    : actor,
                ),
              })),
            })),
          };
        },
      );

      return { snapshots };
    },
    onError: (error, _actorUserId, context) => {
      context?.snapshots.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      createErrorNotification(error as Error);
    },
    onSettled: (_data, _error, actorUserId) => {
      // The inbox itself is not invalidated: the optimistic state already
      // matches the server. Only the follow status of that actor is refreshed.
      queryClient.invalidateQueries({
        queryKey: ["follow", "status", ownUserId, actorUserId],
      });
    },
  });

  return {
    followBack: (actorUserId: string) => {
      mutation.mutate(actorUserId);
    },
    isPending: mutation.isPending,
  };
}
