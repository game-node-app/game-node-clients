import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ApiError,
  type DailyPracticePlayResponseDto,
  DailyPracticeStartRequestDto,
  DailyService,
} from "@repo/wrapper/server";
import { authClient } from "#@/components/auth/authClient";
import type { DailyPracticeMode } from "#@/components/daily/practice/DailyPracticeSection";
import { createErrorNotification } from "#@/util/createErrorNotification";

type Guesses = (number | null)[];
type PracticeRounds = Record<
  string,
  Partial<Record<DailyPracticeMode, string>>
>;

export const DAILY_PRACTICE_STORAGE_KEY = "gamenode-daily-practice";
const GUEST_OWNER = "guest";

/** Round ids by owner (user id or "guest") and mode. Never in URLs or share text. */
function readRounds(): PracticeRounds {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(DAILY_PRACTICE_STORAGE_KEY) ?? "{}",
    );
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeRound(
  owner: string,
  mode: DailyPracticeMode,
  roundId: string | undefined,
) {
  try {
    const rounds = readRounds();
    const owned = { ...rounds[owner] };
    if (roundId) owned[mode] = roundId;
    else delete owned[mode];
    rounds[owner] = owned;
    localStorage.setItem(DAILY_PRACTICE_STORAGE_KEY, JSON.stringify(rounds));
  } catch {
    // Storage unavailable: the round still plays, it just won't resume.
  }
}

/** The round is gone or belongs to someone else. */
const isLostRound = (error: unknown) =>
  error instanceof ApiError && (error.status === 403 || error.status === 404);

/**
 * An unlimited practice round for Cover or Specs: resumes the device's round
 * for this account (or guest) and mode, or starts one. Practice never touches
 * the daily results or the ranking.
 */
export function useDailyPractice(mode: DailyPracticeMode) {
  const queryClient = useQueryClient();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const userId = session?.user.id;
  const owner = userId ?? GUEST_OWNER;
  const queryKey = ["daily", "practice", mode, userId ?? null];

  const start = async () => {
    const response = await DailyService.dailyControllerStartPracticeV1({
      mode: mode as DailyPracticeStartRequestDto.mode,
    });
    writeRound(owner, mode, response.roundId);
    return response;
  };

  const query = useQuery({
    queryKey,
    enabled: !isSessionPending,
    // Re-renders and refocus must never start a new round.
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
    queryFn: async (): Promise<DailyPracticePlayResponseDto> => {
      const roundId = readRounds()[owner]?.[mode];
      if (roundId) {
        try {
          return await DailyService.dailyControllerPlayPracticeV1(roundId, {
            guesses: [],
            hintAt: null,
          });
        } catch (error) {
          if (!isLostRound(error)) throw error;
          writeRound(owner, mode, undefined);
        }
      }
      return start();
    },
  });

  const playMutation = useMutation({
    mutationFn: ({
      guesses,
      hintAt,
    }: {
      guesses: Guesses;
      hintAt?: number | null;
    }) =>
      DailyService.dailyControllerPlayPracticeV1(query.data!.roundId, {
        guesses,
        hintAt,
      }),
    onSuccess: (response) => queryClient.setQueryData(queryKey, response),
    onError: createErrorNotification,
  });

  const restartMutation = useMutation({
    mutationFn: start,
    onSuccess: (response) => queryClient.setQueryData(queryKey, response),
    onError: createErrorNotification,
  });

  const guesses = query.data?.feedback.map((feedback) => feedback.gameId) ?? [];
  const send = (next: Guesses, hintAt = query.data?.hintAt) =>
    playMutation.mutate({ guesses: next, hintAt });

  return {
    ...query,
    isSubmitting: playMutation.isPending,
    isRestarting: restartMutation.isPending,
    guess: (gameId: number) => send([...guesses, gameId]),
    skip: () => send([...guesses, null]),
    useHint: () => send(guesses, guesses.length),
    restart: () => restartMutation.mutate(),
  };
}
