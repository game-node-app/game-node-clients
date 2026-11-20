import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { EntrySplashNative } from "@/plugins/entrySplash";
import { markSplashDone, onAppReady } from "./appReady";

/** Reveals the app anyway if the app shell never reports that it is ready. */
const MAX_WAIT_MS = 3000;

/**
 * Once per app launch (the JS runtime lives as long as the WebView), like the native splash it
 * controls. A remount (StrictMode) must not reveal twice.
 */
let revealed = false;

/**
 * Tells the native entry splash (Android `EntrySplashView`: logo, orange fill, then a zoom into the
 * logo's hole that shows the app from the inside out) when to open onto the app. It renders
 * nothing: the splash is native so that it covers the WebView from the very first frame, before the
 * web app can draw anything.
 *
 * It waits for the app shell to mount (`markAppReady`) and then for that first, long frame to be
 * painted (the second animation frame from then comes after it), so the hole never opens onto a
 * blank WebView.
 */
export default function EntrySplash() {
  useEffect(() => {
    if (revealed) return;
    if (!Capacitor.isNativePlatform()) {
      markSplashDone();
      return;
    }

    let frame: number | undefined;
    let done = false;

    const reveal = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          revealed = true;
          // resolves once the native splash is gone
          EntrySplashNative.reveal()
            .catch(console.error)
            .finally(markSplashDone);
        });
      });
    };

    const timer = setTimeout(reveal, MAX_WAIT_MS);
    const unsubscribe = onAppReady(reveal);

    return () => {
      unsubscribe();
      clearTimeout(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
