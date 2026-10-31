import { authClient } from "#@/components/auth/authClient";

/**
 * QueryCache/MutationCache `onError`: a 401 means the session died server-side (lockout, sign-out elsewhere),
 * and `useSession` can't see that by itself, so refetch it and let `SessionAuth` redirect.
 */
export function handleAuthError(error: unknown) {
  if ((error as { status?: number } | null)?.status === 401) {
    void authClient.getSession({ query: { disableCookieCache: true } });
  }
}
