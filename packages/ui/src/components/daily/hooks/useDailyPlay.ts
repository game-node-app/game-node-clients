import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DailyService } from "@repo/wrapper/server";
import { authClient } from "#@/components/auth/authClient";
import {
  readDailyLocalResults,
  useDailyLocalResults,
} from "#@/components/daily/hooks/useDailyLocalResults";
import { toDailyLocalResult } from "#@/components/daily/util/toDailyLocalResult";
import { createErrorNotification } from "#@/util/createErrorNotification";

type Guesses = (number | null)[];

/**
 * A puzzle's play state. The client always sends the whole play: signed-in
 * progress lives on the server, guest progress in local storage.
 */
export function useDailyPlay(puzzleId: number | undefined) {
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const userId = session?.user.id;
  const [, updateLocal] = useDailyLocalResults();
  const queryKey = ["daily", "play", puzzleId, userId];

  const play = async (guesses: Guesses, hintAt?: number | null) => {
    const response = await DailyService.dailyControllerPlayV1(puzzleId!, {
      guesses,
      hintAt,
    });
    if (!userId) {
      updateLocal((current) => ({
        ...current,
        [response.puzzleId]: toDailyLocalResult(
          response,
          current[response.puzzleId],
        ),
      }));
    }
    return response;
  };

  const query = useQuery({
    queryKey,
    enabled: puzzleId != undefined && !isSessionPending,
    queryFn: async () => {
      const local = readDailyLocalResults()[puzzleId!];
      if (!userId) return play(local?.guesses ?? [], local?.hintAt);

      const saved = await play([]);
      if (saved.attempts > 0 || local?.status !== "in_progress") return saved;
      // A play started before signing in moves to the account.
      const merged = await play(local.guesses, local.hintAt);
      updateLocal(({ [puzzleId!]: _, ...rest }) => rest);
      return merged;
    },
  });

  const mutation = useMutation({
    mutationFn: ({
      guesses,
      hintAt,
    }: {
      guesses: Guesses;
      hintAt?: number | null;
    }) => play(guesses, hintAt),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKey, response);
      return queryClient.invalidateQueries({
        queryKey: ["daily"],
        predicate: ({ queryKey }) => queryKey[1] !== "play",
      });
    },
    onError: createErrorNotification,
  });

  const guesses = query.data?.feedback.map((feedback) => feedback.gameId) ?? [];
  const send = (next: Guesses, hintAt = query.data?.hintAt) =>
    mutation.mutate({ guesses: next, hintAt });

  return {
    ...query,
    isSubmitting: mutation.isPending,
    guess: (gameId: number) => send([...guesses, gameId]),
    skip: () => send([...guesses, null]),
    useHint: () => send(guesses, guesses.length),
  };
}
