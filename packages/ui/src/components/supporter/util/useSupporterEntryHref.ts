import { authClient } from "#@/components/auth/authClient";
import type { SupporterInterval } from "#@/components/supporter/types";
import { getSupporterSettingsHref } from "#@/components/supporter/util/getSupporterSettingsHref";
import { useAuthPath } from "#@/context";

/**
 * Link to the settings Supporter surface, keeping the selected interval.
 *
 * A visitor known to be signed out goes straight to sign-in with the settings
 * URL as the return target, so they come back to the Supporter tab with their
 * interval. While the session is still resolving (including SSR) the settings
 * href is returned: it matches the first render, so there is no hydration
 * mismatch, and the settings modal guard covers a click before it resolves.
 */
export function useSupporterEntryHref(
  interval?: SupporterInterval | null,
): string {
  const { data, isPending } = authClient.useSession();
  const authPath = useAuthPath();
  const settingsHref = getSupporterSettingsHref({ interval });

  if (isPending || data) return settingsHref;

  return `${authPath}?redirectTo=${encodeURIComponent(settingsHref)}`;
}
