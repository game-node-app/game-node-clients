import { PropsWithChildren, useEffect, useRef } from "react";
import { authClient } from "#@/components/auth/authClient";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import { useHooks } from "#@/context";
import { useRouter } from "#@/util/link";

interface Props extends PropsWithChildren {
  /** When false, children render for signed-out users too (no redirect). */
  requireAuth?: boolean;
}

const SessionAuth = ({ requireAuth = true, children }: Props) => {
  const { data, isPending } = authClient.useSession();
  const redirectToAuth = useRedirectToAuth();
  const { asPath, pathname } = useRouter();
  const current = asPath ?? pathname;
  const { useIsViewActive } = useHooks();
  const isViewActive = useIsViewActive?.() ?? true;
  const mustRedirect = isViewActive && requireAuth && !isPending && !data;

  // Deduplicate unstable router callbacks per URL and visit; Ionic keeps pages mounted.
  const redirected = useRef<string | null>(null);
  useEffect(() => {
    if (!mustRedirect) {
      redirected.current = null;
    } else if (redirected.current !== current) {
      redirected.current = current;
      void redirectToAuth();
    }
  }, [mustRedirect, redirectToAuth, current]);

  if (requireAuth && (isPending || !data)) {
    return null;
  }

  return <>{children}</>;
};

export { SessionAuth };
