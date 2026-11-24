import { useReducedMotion } from "@mantine/hooks";
import { useCallback, useEffect, useRef, useState } from "react";

import type { LinaSegment } from "../util";

export interface TypewriterOptions {
  /** Characters per second. Design D5: ~35. */
  cps?: number;
  /** Wait before the first character; the hall uses 400 ms, the accepted state 1000 ms. */
  startDelayMs?: number;
}

export interface TypewriterState {
  /** How many characters of the joined segments are visible. */
  revealed: number;
  /** Length of the joined segments. */
  total: number;
  /** True while the line is still being revealed. */
  isTyping: boolean;
  /** Reveals the whole line at once and stops the timers. */
  complete(): void;
}

interface TypewriterProgress {
  /** The line the progress belongs to; a new line starts at zero again. */
  line: string;
  revealed: number;
}

const DEFAULT_CPS = 35;

/**
 * Reveals Lina's line one character at a time (design D5). The timers live in
 * refs so `complete()` and unmount both stop them; with reduced motion the whole
 * line is available immediately and no timer ever runs.
 */
export function useTypewriter(
  segments: readonly LinaSegment[],
  { cps = DEFAULT_CPS, startDelayMs = 0 }: TypewriterOptions = {},
): TypewriterState {
  const reducedMotion = useReducedMotion();
  const text = segments.map((segment) => segment.text).join("");
  const total = text.length;
  const [progress, setProgress] = useState<TypewriterProgress>(() => ({
    line: text,
    revealed: 0,
  }));
  const startTimerRef = useRef<number | undefined>(undefined);
  const intervalRef = useRef<number | undefined>(undefined);

  // A line change starts at zero without a synchronous effect update.
  const revealed = reducedMotion
    ? total
    : Math.min(progress.line === text ? progress.revealed : 0, total);

  useEffect(() => {
    if (reducedMotion || total === 0) return;

    let step = 0;

    startTimerRef.current = window.setTimeout(
      () => {
        startTimerRef.current = undefined;
        intervalRef.current = window.setInterval(() => {
          step += 1;

          if (step >= total) {
            if (intervalRef.current !== undefined) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = undefined;
            }
            setProgress({ line: text, revealed: total });
            return;
          }

          setProgress({ line: text, revealed: step });
        }, 1000 / cps);
      },
      Math.max(0, startDelayMs),
    );

    return () => {
      if (startTimerRef.current !== undefined) {
        window.clearTimeout(startTimerRef.current);
        startTimerRef.current = undefined;
      }
      if (intervalRef.current !== undefined) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
    };
  }, [text, total, cps, startDelayMs, reducedMotion]);

  const complete = useCallback(() => {
    if (startTimerRef.current !== undefined) {
      window.clearTimeout(startTimerRef.current);
      startTimerRef.current = undefined;
    }
    if (intervalRef.current !== undefined) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setProgress({ line: text, revealed: total });
  }, [text, total]);

  return {
    revealed,
    total,
    isTyping: !reducedMotion && total > 0 && revealed < total,
    complete,
  };
}
