import { useCallback, useEffect, useState } from "react";
import { useRouter } from "#@/util";

type SetUrlStateAction<T> = Partial<T> | ((prev: T) => Partial<T>);

type UseUrlStateOptions = {
  replace?: boolean;
};

export function useUrlState<T extends Record<string, unknown>>(
  defaultState: T,
  options?: UseUrlStateOptions,
): [T, (action: SetUrlStateAction<T>) => void] {
  const router = useRouter();

  const { replace = true } = options ?? {};

  const parseFromUrl = (): T => {
    const query = router.query;
    const parsed: Record<string, unknown> = { ...defaultState };

    for (const key in defaultState) {
      const raw = query.get(key);
      if (raw !== null) {
        try {
          parsed[key] = JSON.parse(raw);
        } catch {
          parsed[key] = raw;
        }
      }
    }

    return parsed as T;
  };

  const [state, setState] = useState<T>(() => parseFromUrl());

  const updateUrl = useCallback(
    (partial: Partial<T>) => {
      const query = new URLSearchParams(router.query.toString());

      for (const key in partial) {
        const value = partial[key];

        if (value === undefined || value === null) {
          query.delete(key);
        } else {
          const encoded =
            typeof value === "string" ? value : JSON.stringify(value);
          query.set(key, encoded);
        }
      }

      const url = `${router.pathname}?${query.toString()}`;
      router.push(url, { replace, scroll: false, shallow: true });
    },
    [router, replace],
  );

  const setUrlState = useCallback(
    (action: SetUrlStateAction<T>) => {
      setState((prev) => {
        const partial = typeof action === "function" ? action(prev) : action;

        const next = { ...prev, ...partial };
        updateUrl(partial);
        return next;
      });
    },
    [updateUrl],
  );

  useEffect(() => {
    const parsed = parseFromUrl();
    setState((prev) => {
      const hasChanged = Object.keys(defaultState).some(
        (key) => parsed[key] !== prev[key],
      );
      return hasChanged ? parsed : prev;
    });
  }, [router.query.toString()]);

  return [state, setUrlState];
}
