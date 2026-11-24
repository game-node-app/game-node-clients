import { ApiError } from "@repo/wrapper/server";

/**
 * Code returned by every gated Guild player route while the server is in
 * supporter early access and the caller has no access.
 */
export const GUILD_EARLY_ACCESS_REQUIRED = "guild_early_access_required";

/**
 * Reads the machine-readable `code` of an API error body. Non-API errors (or
 * validation errors without a code) return `undefined`.
 */
export function getGuildErrorCode(err: unknown): string | undefined {
  if (!err || typeof err !== "object") return undefined;

  const body = (err as { body?: unknown }).body;
  if (!body || typeof body !== "object") return undefined;

  const code = (body as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

/**
 * True only for the Guild early-access gate: HTTP 403 with
 * `code: "guild_early_access_required"`.
 */
export function isGuildEarlyAccessError(err: unknown): boolean {
  if (getGuildErrorCode(err) !== GUILD_EARLY_ACCESS_REQUIRED) return false;

  const status =
    err instanceof ApiError
      ? err.status
      : (err as { status?: unknown } | null | undefined)?.status;

  return status === 403;
}

/**
 * Guild queries keep the default retry budget for transient failures but never
 * retry the early-access gate (the spec forbids retrying it in a loop).
 */
export function retryUnlessGuildEarlyAccess(
  failureCount: number,
  error: unknown,
): boolean {
  return !isGuildEarlyAccessError(error) && failureCount < 2;
}
