import { PropsWithChildren, useEffect, useRef } from "react";
import { authClient } from "#@/components/auth/authClient";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import { isAuthPath } from "#@/components/auth/getSafeRedirectPath";
import { useAuthPath, useHooks } from "#@/context";
import { useRouter } from "#@/util/link";

interface Props extends PropsWithChildren {
  /** When false, children render for signed-out users too (no redirect). */
  requireAuth?: boolean;
}

const SessionAuth = ({ requireAuth = true, children }: Props) => {
  const { data, isPending } = authClient.useSession();
  const redirectToAuth = useRedirectToAuth();
  const { asPath, pathname } = useRouter();
  const authPath = useAuthPath();
  const { useIsViewActive } = useHooks();
  const isViewActive = useIsViewActive?.() ?? true;
  // Ionic can still report the auth URL when a cached page re-enters; wait for the page's own URL.
  const onAuthPage = isAuthPath(asPath ?? pathname, authPath);
  const mustRedirect =
    isViewActive && requireAuth && !isPending && !data && !onAuthPage;

  // Once per active signed-out visit: router hooks return a new `push` every render and Ionic keeps pages mounted.
  const redirected = useRef(false);
  useEffect(() => {
    if (!mustRedirect) {
      redirected.current = false;
    } else if (!redirected.current) {
      redirected.current = true;
      void redirectToAuth();
    }
  }, [mustRedirect, redirectToAuth]);

  if (requireAuth && (isPending || !data)) {
    return null;
  }

  return <>{children}</>;
};

export { SessionAuth };
