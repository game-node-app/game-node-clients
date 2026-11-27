import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GuildBoardResponseDto, GuildService } from "@repo/wrapper/server";
import { guildKeys, invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

export type RerollGuildBoardEntryInput = {
  boardEntryId: string;
};

/**
 * Rerolls an open weekly quest. The server updates the entry in place, so the
 * response keeps the same `boardEntryId`; every cached board (weekly and
 * `quick`) is patched with the replacement and the reroll counters, then the
 * board and rewards reads are refreshed (design D2).
 */
export function useRerollGuildBoardEntry() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: ({ boardEntryId }: RerollGuildBoardEntryInput) =>
      GuildService.guildControllerRerollBoardEntryV1(boardEntryId),
    onSuccess: (result) => {
      const entryId = result.quest.boardEntryId;
      const cachedBoards = queryClient.getQueriesData<GuildBoardResponseDto>({
        queryKey: guildKeys.boardRoot(),
      });

      for (const [queryKey, board] of cachedBoards) {
        if (!board) continue;

        queryClient.setQueryData<GuildBoardResponseDto>(queryKey, {
          ...board,
          rerollsRemaining: result.rerollsRemaining,
          rerollChartersOwned: result.rerollChartersOwned,
          quests: entryId
            ? board.quests.map((quest) =>
                quest.boardEntryId === entryId ? result.quest : quest,
              )
            : board.quests,
        });
      }

      void queryClient.invalidateQueries({ queryKey: guildKeys.boardRoot() });
      void queryClient.invalidateQueries({ queryKey: guildKeys.rewardsRoot() });
    },
    onError: (error) => handleError(error),
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
