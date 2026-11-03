import { useCallback } from "react";
import { readLocalStorageValue, useLocalStorage } from "@mantine/hooks";
import type { DailyLocalResult } from "#@/components/daily/util/toDailyLocalResult";

export type DailyLocalResults = Record<number, DailyLocalResult>;

const STORAGE = {
  key: "gamenode-daily-results",
  defaultValue: {} as DailyLocalResults,
  deserialize: (value: string | undefined): DailyLocalResults => {
    try {
      const parsed = JSON.parse(value ?? "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  },
};

/**
 * Guest results by puzzle id, shared by every caller.
 */
export function useDailyLocalResults() {
  const [results, setResults] = useLocalStorage<DailyLocalResults>({
    ...STORAGE,
    // prevents SSR hydration mismatches
    getInitialValueInEffect: true,
  });

  // Updates from storage, not state, so a write before the effect has loaded it can't wipe entries.
  const update = useCallback(
    (updater: (current: DailyLocalResults) => DailyLocalResults) =>
      setResults(updater(readDailyLocalResults())),
    [setResults],
  );

  return [results, update] as const;
}

export const readDailyLocalResults = () => readLocalStorageValue(STORAGE);
