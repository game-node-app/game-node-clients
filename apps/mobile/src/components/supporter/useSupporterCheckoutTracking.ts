import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { SUPPORTER_QUERY_KEYS } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

export type SupporterCheckoutTracking = {
  /**
   * True once a checkout was started and the native browser or the app resume
   * signalled that the user may have returned. The supporter screen shows its
   * bounded activation-pending state while this is true.
   */
  pendingCheckout: boolean;
  /** Must be called before opening the Stripe Checkout URL. */
  onCheckoutStarted: () => void;
};

/**
 * Native checkout return tracking. Checkout runs in the system browser, so the
 * page cannot see the redirect itself: it listens for the browser sheet
 * closing and for the app becoming active, then re-reads the server-owned
 * entitlement. The App Link may deliver `?checkout=success` independently; the
 * page lets the route result win over this local pending state.
 */
export function useSupporterCheckoutTracking(): SupporterCheckoutTracking {
  const queryClient = useQueryClient();
  const checkoutStarted = useRef(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  useEffect(() => {
    const refreshCheckoutStatus = () => {
      // browserFinished and appStateChange can fire for unrelated reasons
      // (an ordinary browser use, backgrounding the app); only a checkout
      // started from this page may turn those into a status refresh.
      if (!checkoutStarted.current) return;

      setPendingCheckout(true);
      void queryClient.invalidateQueries({
        queryKey: SUPPORTER_QUERY_KEYS.me,
      });
    };

    const browserListener = Browser.addListener(
      "browserFinished",
      refreshCheckoutStatus,
    );
    const appListener = App.addListener("appStateChange", ({ isActive }) => {
      if (isActive) refreshCheckoutStatus();
    });

    return () => {
      void browserListener
        .then((handle) => handle.remove())
        .catch(() => undefined);
      void appListener.then((handle) => handle.remove()).catch(() => undefined);
    };
  }, [queryClient]);

  return {
    pendingCheckout,
    onCheckoutStarted: () => {
      checkoutStarted.current = true;
    },
  };
}
