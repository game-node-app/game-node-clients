import { useEffect } from "react";
import { useUserId, useUserProfile } from "@repo/ui";
import posthog from "posthog-js";

export function usePostHogUserListener() {
  const userId = useUserId();
  const { data: userProfile } = useUserProfile(userId);

  useEffect(() => {
    if (userId && userProfile) {
      console.log("Identifying user ", userId);
      posthog.identify(userId, {
        username: userProfile.username,
        id: userId,
        joined_at: userProfile.createdAt,
      });
    }
  }, [userId, userProfile]);

  return;
}
