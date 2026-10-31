export type AuthErrorKey =
  | "account_not_linked"
  | "email_not_found"
  | "access_denied"
  | "expired"
  | "unable_to_link_account"
  | "default";

/** Maps a Better Auth `?error=` code to its `auth.errors.<key>` copy. Lockouts are `isLockedOutError`. */
export function getAuthErrorKey(code: string | null | undefined): AuthErrorKey {
  switch (code?.toLowerCase()) {
    case "account_not_linked":
    case "email_not_found":
    case "access_denied":
    case "unable_to_link_account":
      return code.toLowerCase() as AuthErrorKey;
    case "state_mismatch":
    case "please_restart_the_process":
      return "expired";
    default:
      return "default";
  }
}

/** The server reports a locked-out account as `banned` (callback) or `BANNED_USER` (sign-in). */
export function isLockedOutError(code: string | null | undefined) {
  return code?.toLowerCase() === "banned" || code === "BANNED_USER";
}
