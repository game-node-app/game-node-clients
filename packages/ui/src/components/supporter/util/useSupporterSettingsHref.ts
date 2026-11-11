import { getSupporterSettingsHref } from "#@/components/supporter/util/getSupporterSettingsHref";
import { useHooks } from "#@/context";

/**
 * Link to the settings Supporter surface. Apps whose router needs a different
 * route (mobile) register it in the hook registry; every other app gets the
 * canonical settings URL.
 */
export function useSupporterSettingsHref(): string {
  return useHooks().supporterSettingsHref ?? getSupporterSettingsHref();
}
