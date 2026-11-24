import { notifications } from "@mantine/notifications";
import { ApiError } from "@repo/wrapper/server";
import { getErrorMessage } from "#@/util/getErrorMessage.ts";

/**
 * A hidden resource (another user's private/followers-only library, entry,
 * collection, play log or recap) is answered with the same 404 as a missing
 * one. Retrying cannot make it visible, so it is a final "not visible" answer.
 */
export function isNotFoundApiError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 404;
}

/**
 * Keeps a query's retry budget for transient failures but never retries a 404,
 * so hidden data does not produce a retry loop before the empty state renders.
 */
export function retryUnlessHidden(
  failureCount: number,
  error: unknown,
): boolean {
  return !isNotFoundApiError(error) && failureCount < 2;
}

/**
 * Default query retry for the apps: a 4xx (signed out, forbidden, not found,
 * invalid) is a final answer, so only network errors, 5xx, 408 and 429 spend
 * the retry budget. Retrying a 401 for a signed-out visitor only delayed the
 * empty state and tripled the requests.
 */
export function retryTransientErrors(maxRetries: number) {
  return (failureCount: number, error: unknown): boolean => {
    const status = error instanceof ApiError ? error.status : undefined;
    if (
      status !== undefined &&
      status >= 400 &&
      status < 500 &&
      status !== 408 &&
      status !== 429
    ) {
      return false;
    }
    return failureCount < maxRetries;
  };
}

export function createErrorNotification(err: Error) {
  console.error(err);
  notifications.show({
    color: "red",
    message: getErrorMessage(err),
  });
}
