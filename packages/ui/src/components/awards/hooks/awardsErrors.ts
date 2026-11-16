import { ApiError } from "@repo/wrapper/server";

/**
 * A curated 404 (`events/current` without a started event, scoreboard without
 * results) is a valid "nothing here" answer, not a transient failure.
 */
export function isAwardsNotFoundError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 404;
}

/** Retries transient failures but never a curated 404. */
export function retryUnlessNotFound(
  failureCount: number,
  error: unknown,
): boolean {
  return !isAwardsNotFoundError(error) && failureCount < 2;
}
