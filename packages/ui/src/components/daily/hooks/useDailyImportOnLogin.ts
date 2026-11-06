import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DailyService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  readDailyLocalResults,
  useDailyLocalResults,
} from "#@/components/daily/hooks/useDailyLocalResults";

/**
 * Moves finished guest results into the account once the user signs in.
 * In-progress ones are merged by `useDailyPlay` when that puzzle is opened.
 */
export function useDailyImportOnLogin() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const [, updateLocal] = useDailyLocalResults();
  // Guards against the effect running twice (StrictMode) and importing twice.
  const importedFor = useRef<string>(undefined);

  useEffect(() => {
    if (!userId || importedFor.current === userId) return;
    const finished = Object.values(readDailyLocalResults()).filter(
      (result) => result.status !== "in_progress",
    );
    if (finished.length === 0) return;
    importedFor.current = userId;

    DailyService.dailyControllerImportResultsV1({
      results: finished.map(({ puzzleId, guesses, hintAt }) => ({
        puzzleId,
        guesses,
        hintAt,
      })),
    })
      .then(() => {
        updateLocal((current) =>
          Object.fromEntries(
            Object.entries(current).filter(
              ([, result]) => result.status === "in_progress",
            ),
          ),
        );
        return queryClient.invalidateQueries({ queryKey: ["daily"] });
      })
      .catch(console.error);
  }, [userId, queryClient, updateLocal]);
}
