const MAX_QUERY_RETRIES = 3;

/**
 * QueryClient `retry`: 401/403 mean the session or permission is the problem, so repeating the
 * request only delays the sign-in prompt. Everything else keeps the default of three retries.
 */
export function shouldRetryQuery(
  failureCount: number,
  error: unknown,
): boolean {
  const status = (error as { status?: number } | null)?.status;
  if (status === 401 || status === 403) {
    return false;
  }
  return failureCount < MAX_QUERY_RETRIES;
}
