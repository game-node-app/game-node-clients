import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "#@/components/auth/authClient";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  getOAuthConsentsKey,
  OAuthConnectedApp,
} from "#@/components/settings/hooks/useOAuthConsents";
import { createErrorNotification } from "#@/util";

/** Deletes one OAuth consent (`POST /oauth2/delete-consent`), disconnecting that app. */
export function useRevokeOAuthConsent() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = getOAuthConsentsKey(userId);

  return useMutation({
    mutationFn: async (consentId: string) => {
      const { error } = await authClient.$fetch("/oauth2/delete-consent", {
        method: "POST",
        body: { id: consentId },
      });
      if (error) {
        throw new Error(error.message || error.statusText);
      }
      return consentId;
    },
    onSuccess: (consentId) => {
      queryClient.setQueryData<OAuthConnectedApp[]>(queryKey, (apps) =>
        apps?.filter((app) => app.id !== consentId),
      );
    },
    onError: createErrorNotification,
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });
}
