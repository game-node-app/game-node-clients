import { ApiError } from "@repo/wrapper/server";

export interface CollectionLimitError {
  /** Server-provided collection limit, when it is a positive integer. */
  limit: number | null;
}

/**
 * Reads the server's free-account collection limit rejection (design D12). The
 * client decides from the body `code`, not from the status alone, so other 403s
 * keep their generic error handling.
 */
export function getCollectionLimitError(
  error: unknown,
): CollectionLimitError | null {
  if (!(error instanceof ApiError)) return null;
  if (error.body?.code !== "collection_limit_reached") return null;

  const rawLimit = error.body?.limit;
  const limit =
    typeof rawLimit === "number" && Number.isInteger(rawLimit) && rawLimit > 0
      ? rawLimit
      : null;

  return { limit };
}
