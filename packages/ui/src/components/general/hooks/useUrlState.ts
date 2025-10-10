import { useCallback, useEffect, useState } from "react";
import { useRouter } from "#@/util";

type SetUrlStateAction<T> = Partial<T> | ((prev: T) => Partial<T>);

type UseUrlStateOptions = {
  replace?: boolean;
};

export function useUrlState<T extends object>(
  defaultState: T,
  options?: UseUrlStateOptions,
): [T, (action: SetUrlStateAction<T>) => void] {
  const router = useRouter();
  const { replace = true } = options ?? {};

  // Iterate over keys explicitly using Object.keys
  const parseFromUrl = (): T => {
    const query = router.query;
    const parsed = { ...defaultState } as T;

    Object.keys(defaultState).forEach((key) => {
      const raw = query.get(key);
      if (raw !== null) {
        try {
          parsed[key as keyof T] = JSON.parse(raw);
        } catch {
          parsed[key as keyof T] = raw as never;
        }
      }
    });

    return parsed;
  };

  const [state, setState] = useState<T>(() => parseFromUrl());

  const updateUrl = useCallback(
    (partial: Partial<T>) => {
      const query = new URLSearchParams(router.query.toString());

      Object.keys(partial).forEach((key) => {
        const value = partial[key as keyof T];
        if (value === undefined || value === null) {
          query.delete(key);
        } else {
          const encoded =
            typeof value === "string" ? value : JSON.stringify(value);
          query.set(key, encoded);
        }
      });

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
        (key) => parsed[key as keyof T] !== prev[key as keyof T],
      );
      return hasChanged ? parsed : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.toString()]);

  return [state, setUrlState];
}
