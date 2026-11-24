import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  GuildBoardSeenResponseDto,
  GuildOverviewResponseDto,
} from "@repo/wrapper/server";
import { guildKeys, invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

/**
 * Marks the current board as seen and hides the `!` balloon optimistically.
 */
export function useMarkGuildBoardSeen() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();
  const overviewKey = guildKeys.overview(userId);

  return useMutation({
    mutationFn: () => GuildService.guildControllerMarkBoardSeenV1(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: overviewKey });
      const previous =
        queryClient.getQueryData<GuildOverviewResponseDto>(overviewKey);

      if (previous) {
        queryClient.setQueryData<GuildOverviewResponseDto>(overviewKey, {
          ...previous,
          lina: { ...previous.lina, hasUnseenBoard: false },
        });
      }

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(overviewKey, context.previous);
      }
      handleError(error);
    },
    onSuccess: (result: GuildBoardSeenResponseDto) => {
      const previous =
        queryClient.getQueryData<GuildOverviewResponseDto>(overviewKey);
      if (previous) {
        queryClient.setQueryData<GuildOverviewResponseDto>(overviewKey, {
          ...previous,
          lina: {
            ...previous.lina,
            hasUnseenBoard: result.hasUnseenBoard,
          },
        });
      }
    },
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
