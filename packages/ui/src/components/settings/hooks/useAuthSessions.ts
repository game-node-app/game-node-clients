import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "#@/components/auth/authClient";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { ExtendedUseQueryResult } from "#@/util";

/** One active session of the signed-in user, as returned by better-auth. */
export type AuthSession = NonNullable<
  Awaited<ReturnType<typeof authClient.listSessions>>["data"]
>[number];

/** better-auth error, kept as an `Error` with its `status` (for `handleAuthError`) and `code`. */
export type AuthClientError = Error & { status?: number; code?: string };

/** better-auth returns `{ data, error }` instead of throwing; turn `error` into a throwable. */
export function toAuthClientError(error: {
  message?: string;
  statusText?: string;
  status?: number;
  code?: string;
}): AuthClientError {
  return Object.assign(
    new Error(error.message || error.statusText || String(error.status ?? "")),
    { status: error.status, code: error.code },
  );
}

/** better-auth only lists sessions while the current one is "fresh" (recently signed in). */
export const SESSION_NOT_FRESH_CODE = "SESSION_NOT_FRESH";

export function getAuthSessionsKey(userId: string | undefined) {
  return ["settings", "sessions", userId ?? null];
}

/** Active sessions (devices) of the signed-in user. */
export function useAuthSessions(): ExtendedUseQueryResult<
  AuthSession[],
  AuthClientError
> {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const queryKey = getAuthSessionsKey(userId);
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey });
  };

  return {
    queryKey,
    invalidate,
    ...useQuery({
      queryKey,
      queryFn: async () => {
        const { data, error } = await authClient.listSessions();
        if (error) throw toAuthClientError(error);
        return data;
      },
      enabled: !!userId,
      // Sessions change outside this tab (other devices), so refetch on every visit.
      staleTime: 0,
      refetchOnMount: true,
      retry: (failureCount, error) =>
        (error as AuthClientError).code !== SESSION_NOT_FRESH_CODE &&
        (error as AuthClientError).status !== 401 &&
        failureCount < 2,
    }),
  };
}
