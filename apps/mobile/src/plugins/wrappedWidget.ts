import { registerPlugin } from "@capacitor/core";
import type { DailyWidgetSnapshot, WrappedWidgetSnapshot } from "@repo/ui";

export type WrappedWidgetKind =
  | "hours"
  | "topGame"
  | "top3"
  | "poster"
  | "daily";

/**
 * Native bridge (Android only, `WrappedWidgetPlugin.java`) that feeds the
 * Wrapped home screen widgets. The widgets render the last snapshot written
 * here, so they only refresh while the app is running.
 */
export interface WrappedWidgetPlugin {
  update(options: { snapshot: WrappedWidgetSnapshot }): Promise<void>;
  /** Wipes the cached snapshot (e.g. on sign out); widgets show their empty state. */
  clear(): Promise<void>;
  /** Feeds the GameNode Daily widget, which has its own snapshot. */
  updateDaily(options: { snapshot: DailyWidgetSnapshot }): Promise<void>;
  clearDaily(): Promise<void>;
  isSupported(): Promise<{ supported: boolean }>;
  requestPin(options: {
    widget: WrappedWidgetKind;
  }): Promise<{ requested: boolean }>;
}

export const WrappedWidget =
  registerPlugin<WrappedWidgetPlugin>("WrappedWidget");
