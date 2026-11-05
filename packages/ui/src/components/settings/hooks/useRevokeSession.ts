import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "#@/components/auth/authClient";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  getAuthSessionsKey,
  toAuthClientError,
} from "#@/components/settings/hooks/useAuthSessions";
import { createErrorNotification } from "#@/util";

function useInvalidateSessions() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: getAuthSessionsKey(userId) });
}

/** Signs out one of the user's other sessions (by its token). */
export function useRevokeSession() {
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: async (token: string) => {
      const { error } = await authClient.revokeSession({ token });
      if (error) throw toAuthClientError(error);
    },
    onError: createErrorNotification,
    onSettled: invalidate,
  });
}

/** Signs out every session except the current one. */
export function useRevokeOtherSessions() {
  const invalidate = useInvalidateSessions();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.revokeOtherSessions();
      if (error) throw toAuthClientError(error);
    },
    onError: createErrorNotification,
    onSettled: invalidate,
  });
}
