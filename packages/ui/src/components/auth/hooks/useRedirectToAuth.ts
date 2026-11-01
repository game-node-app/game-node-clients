import { useCallback } from "react";
import { useAuthPath } from "#@/context";
import { useRouter } from "#@/util/link";
import { isAuthPath } from "#@/components/auth/getSafeRedirectPath";

/** Sends the user to the sign-in screen, which returns them to the current page afterwards. */
export function useRedirectToAuth() {
  const router = useRouter();
  const authPath = useAuthPath();
  const { asPath, pathname, push } = router;
  const current = asPath ?? pathname;

  return useCallback(
    async () => {
      // Ionic keeps signed-out pages mounted; later guards must not nest the auth page into its own redirectTo.
      if (isAuthPath(current, authPath)) return;
      await push(`${authPath}?redirectTo=${encodeURIComponent(current)}`, {
        absolute: true,
      });
    },
    [push, authPath, current],
  );
}
