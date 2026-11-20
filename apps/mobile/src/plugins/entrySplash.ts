import { registerPlugin } from "@capacitor/core";

/** Native entry splash (Android `EntrySplashView`), drawn over the WebView from launch. */
export interface EntrySplashPlugin {
  /** The app has painted: play the reveal (or fade out) and remove the splash. Resolves once it is gone. */
  reveal(): Promise<void>;
}

export const EntrySplashNative =
  registerPlugin<EntrySplashPlugin>("EntrySplash");
