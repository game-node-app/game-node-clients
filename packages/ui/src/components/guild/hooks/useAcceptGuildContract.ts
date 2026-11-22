import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AcceptGuildContractDto, GuildService } from "@repo/wrapper/server";
import { invalidateGuild } from "./guildKeys";
import { useGuildMutationErrorHandler } from "./useGuildMutationErrorHandler";

export type AcceptGuildContractInput = AcceptGuildContractDto;

/**
 * Accepts a board entry or curated event. The body always carries exactly one
 * of `boardEntryId`/`eventId`, plus the picked `targetGameId` when required.
 */
export function useAcceptGuildContract() {
  const queryClient = useQueryClient();
  const handleError = useGuildMutationErrorHandler();

  return useMutation({
    mutationFn: (input: AcceptGuildContractInput) => {
      const body: AcceptGuildContractDto = {};

      if (input.boardEntryId) {
        body.boardEntryId = input.boardEntryId;
      } else if (input.eventId) {
        body.eventId = input.eventId;
      } else {
        throw new Error("Provide exactly one of boardEntryId or eventId.");
      }

      if (input.targetGameId !== undefined) {
        body.targetGameId = input.targetGameId;
      }

      return GuildService.guildControllerAcceptContractV1(body);
    },
    onError: handleError,
    onSettled: () => {
      void invalidateGuild(queryClient);
    },
  });
}
