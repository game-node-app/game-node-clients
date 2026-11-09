import { ApiError } from "@repo/wrapper/server";

/** Callbacks shared by the cover choice mutations (design Decision 8). */
export interface GameCoverChoiceMutationOptions {
  /**
   * A 401 shows the picker's sign-in prompt. The mutation also skips the global
   * `handleAuthError` (see `meta.skipAuthError`), so the session refetch cannot
   * redirect away before the prompt shows.
   */
  onUnauthorized?: () => void;
}

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
