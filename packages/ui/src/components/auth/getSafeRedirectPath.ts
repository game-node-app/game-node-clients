/** Only same-origin relative paths are valid return targets. */
export function getSafeRedirectPath(
  redirectTo: string | null | undefined,
  fallback: string,
) {
  if (!redirectTo || !/^\/(?![/\\])/.test(redirectTo)) return fallback;
  try {
    return new URL(redirectTo, "https://redirect.invalid").origin ===
      "https://redirect.invalid"
      ? redirectTo
      : fallback;
  } catch {
    return fallback;
  }
}
