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

export function createErrorNotification(err: Error) {
  console.error(err);
  notifications.show({
    color: "red",
    message: getErrorMessage(err),
  });
}
