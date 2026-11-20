/**
 * One-shot "the app shell has mounted" signal for the entry splash. The splash used to wait for
 * `document.readyState === "complete"`, which also waits for every image and third-party script
 * the first page happens to request, so it held the splash for seconds after the app could show.
 */
let ready = false;
const listeners = new Set<() => void>();

export function markAppReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((listener) => listener());
  listeners.clear();
}

export function isAppReady() {
  return ready;
}

/** Calls `listener` once the app is ready (right away if it already is). Returns an unsubscribe. */
export function onAppReady(listener: () => void): () => void {
  if (ready) {
    listener();
    return () => {};
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Resolves once the entry splash is gone (or, off native, right after the app is ready). Heavy work
 * that would cross the native bridge, like saving the query cache, waits for it: Capacitor decodes
 * every plugin call on the UI thread, which is the thread animating the splash.
 */
let finishSplash: () => void = () => {};
const splashDone = new Promise<void>((resolve) => {
  finishSplash = resolve;
});

export function markSplashDone() {
  finishSplash();
}

export function whenSplashDone(): Promise<void> {
  return splashDone;
}
