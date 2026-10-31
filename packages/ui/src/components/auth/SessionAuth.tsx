import { PropsWithChildren, useEffect, useRef } from "react";
import { authClient } from "#@/components/auth/authClient";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";

interface Props extends PropsWithChildren {
  /** When false, children render for signed-out users too (no redirect). */
  requireAuth?: boolean;
}

const SessionAuth = ({ requireAuth = true, children }: Props) => {
  const { data, isPending } = authClient.useSession();
  const redirectToAuth = useRedirectToAuth();
  const mustRedirect = requireAuth && !isPending && !data;

  // Once per signed-out spell: router hooks return a new `push` every render and Ionic keeps pages mounted.
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
