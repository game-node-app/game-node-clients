import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import {
  getActiveSupporterPerks,
  type ActiveSupporterPerks,
} from "../perks/supporterPerks";

/**
 * The renderable perks for a user's profile. Thin wrapper over the shared
 * profile read, so avatars and the header reuse one cache entry (design D2).
 */
export function useSupporterPerks(
  userId: string | undefined | null,
): ActiveSupporterPerks | null {
  const profileQuery = useUserProfile(userId);

  return getActiveSupporterPerks(profileQuery.data);
}
