import { useEffect, useState } from "react";
import { isSplashDone, whenSplashDone } from "./appReady";

/**
 * Whether the entry splash is gone (see `EntrySplash`). Registered as the `useEntrySplashDone` UI hook so
 * shared overlays, like the Ruins boot sequence, start after the native splash instead of under it.
 */
export function useEntrySplashDone(): boolean {
  const [done, setDone] = useState(isSplashDone);

  useEffect(() => {
    if (done) return;
    let active = true;
    void whenSplashDone().then(() => {
      if (active) setDone(true);
    });
    return () => {
      active = false;
    };
  }, [done]);

  return done;
}
