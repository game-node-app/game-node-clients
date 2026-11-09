import { authClient } from "#@/components/auth/authClient";

type AuthErrorHandlingTarget = {
  meta?: {
    /**
     * Set by mutations that show their own sign-in prompt (e.g. the cover
     * picker): refreshing the session here would let `SessionAuth` redirect
     * before that prompt is shown.
     */
    skipAuthError?: boolean;
  };
};

/**
 * QueryCache/MutationCache `onError`: a 401 means the session died server-side (lockout, sign-out elsewhere),
 * and `useSession` can't see that by itself, so refetch it and let `SessionAuth` redirect.
 *
 * QueryCache calls it with `(error, query)` and MutationCache with
 * `(error, variables, context, mutation)`; the last argument carries `meta`.
 */
export function handleAuthError(error: unknown, ...rest: unknown[]) {
  if ((error as { status?: number } | null)?.status !== 401) {
    return;
  }

  const target = rest[rest.length - 1] as AuthErrorHandlingTarget | undefined;
  if (target?.meta?.skipAuthError) {
    return;
  }

  void authClient.getSession({ query: { disableCookieCache: true } });
}
