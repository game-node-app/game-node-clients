/** Only same-origin relative paths are valid return targets (blocks `//host` and absolute URLs). */
export function getSafeRedirectPath(
  redirectTo: string | null | undefined,
  fallback: string,
) {
  return redirectTo && /^\/(?![/\\])/.test(redirectTo) ? redirectTo : fallback;
}
