import { useCallback, useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import type { RecapPeriod } from "@repo/ui";

export const WIDGET_PERIODS: RecapPeriod[] = ["week", "month", "year"];
export const DEFAULT_WIDGET_PERIOD: RecapPeriod = "year";

const WIDGET_PERIOD_KEY = "gamenode-widget-period";
const CHANGE_EVENT = "gamenode-widget-period-change";

function isWidgetPeriod(value: unknown): value is RecapPeriod {
  return WIDGET_PERIODS.includes(value as RecapPeriod);
}

function readLocal(): RecapPeriod {
  try {
    const value = window.localStorage.getItem(WIDGET_PERIOD_KEY);
    if (isWidgetPeriod(value)) return value;
  } catch {
    // localStorage can be unavailable; Preferences below is the source of truth.
  }
  return DEFAULT_WIDGET_PERIOD;
}

/**
 * Period (weekly / monthly / yearly) the Android home screen widgets cover. Persisted in Capacitor
 * Preferences (mirrored to localStorage for a synchronous first render) and shared between the
 * preference picker and `WrappedWidgetSync` through a window event.
 */
export function useWidgetPeriod(): [RecapPeriod, (period: RecapPeriod) => void] {
  const [period, setInternalPeriod] = useState<RecapPeriod>(readLocal);

  useEffect(() => {
    let cancelled = false;
    Preferences.get({ key: WIDGET_PERIOD_KEY })
      .then(({ value }) => {
        if (!cancelled && isWidgetPeriod(value)) setInternalPeriod(value);
      })
      .catch(console.error);

    const onChange = (event: Event) => {
      const next = (event as CustomEvent<RecapPeriod>).detail;
      if (isWidgetPeriod(next)) setInternalPeriod(next);
    };
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => {
      cancelled = true;
      window.removeEventListener(CHANGE_EVENT, onChange);
    };
  }, []);

  const setPeriod = useCallback((next: RecapPeriod) => {
    setInternalPeriod(next);
    try {
      window.localStorage.setItem(WIDGET_PERIOD_KEY, next);
    } catch {
      // ignore
    }
    Preferences.set({ key: WIDGET_PERIOD_KEY, value: next }).catch(
      console.error,
    );
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
  }, []);

  return [period, setPeriod];
}
