import { useCallback } from "react";
import { useAuthPath } from "#@/context";
import { useRouter } from "#@/util/link";

/** Sends the user to the sign-in screen, which returns them to the current page afterwards. */
export function useRedirectToAuth() {
  const router = useRouter();
  const authPath = useAuthPath();
  const { asPath, pathname, push } = router;
  const current = asPath ?? pathname;

  return useCallback(
    () =>
      push(`${authPath}?redirectTo=${encodeURIComponent(current)}`, {
        absolute: true,
      }),
    [push, authPath, current],
  );
}
