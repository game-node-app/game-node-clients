/** Whether `path` is the sign-in page itself (ignoring its query). */
export function isAuthPath(path: string, authPath: string) {
  return (
    path.startsWith(authPath) && /^(?:$|[?#/])/.test(path.slice(authPath.length))
  );
}

/** Only same-origin relative paths are valid return targets; the sign-in page itself never is. */
export function getSafeRedirectPath(
  redirectTo: string | null | undefined,
  fallback: string,
  authPath?: string,
) {
  if (!redirectTo || !/^\/(?![/\\])/.test(redirectTo)) return fallback;
  if (authPath && isAuthPath(redirectTo, authPath)) return fallback;
  try {
    return new URL(redirectTo, "https://redirect.invalid").origin ===
      "https://redirect.invalid"
      ? redirectTo
      : fallback;
  } catch {
    return fallback;
  }
}
