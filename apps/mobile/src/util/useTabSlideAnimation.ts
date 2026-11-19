import { MOBILE_TABS } from "@/util/getTabAwareHref";
import type { IonRouterOutlet } from "@ionic/react";
import { type ComponentRef, useLayoutEffect, useRef } from "react";

export function useTabSlideAnimation(pathname: string) {
  const outletRef = useRef<ComponentRef<typeof IonRouterOutlet>>(null);
  const pendingSlide = useRef<{
    tab: string;
    /** 1 when the new tab is to the right of the old one (enters from the right), else -1. */
    direction: 1 | -1;
    /** The page on screen when the switch started. */
    leaving?: HTMLElement;
  }>(undefined);

  useLayoutEffect(() => {
    const outlet = outletRef.current;
    if (!outlet) return;

    const currentTab = pathname.split("/")[1];
    if (pendingSlide.current?.tab !== currentTab)
      pendingSlide.current = undefined;

    let animation: Animation | undefined;
    let leavingAnimation: Animation | undefined;
    let leavingPage: HTMLElement | undefined;
    const releaseLeavingPage = () => {
      // gives the page back to Ionic, which keeps it hidden through `ion-page-hidden`
      leavingPage?.style.removeProperty("display");
      leavingPage = undefined;
    };
    const onViewWillEnter = ({ target }: Event) => {
      const slide = pendingSlide.current;
      if (
        !slide ||
        slide.tab !== currentTab ||
        !(target instanceof HTMLElement) ||
        target.parentElement !== outlet
      ) {
        return;
      }

      pendingSlide.current = undefined;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const options = { duration: 280, easing: "cubic-bezier(0.32, 0.72, 0, 1)" };
      // like the native Android tab switch: the new page pushes the old one out sideways
      animation = target.animate?.(
        [
          { transform: `translateX(${slide.direction * 100}%)` },
          { transform: "translateX(0)" },
        ],
        options,
      );

      const leaving = slide.leaving;
      if (leaving && leaving !== target && leaving.parentElement === outlet) {
        // Ionic hides the old page with `display: none !important`; only an inline
        // !important beats that, until the slide ends.
        leaving.style.setProperty("display", "block", "important");
        leavingPage = leaving;
        leavingAnimation = leaving.animate?.(
          [
            { transform: "translateX(0)" },
            { transform: `translateX(${slide.direction * -100}%)` },
          ],
          options,
        );
        if (leavingAnimation) leavingAnimation.onfinish = releaseLeavingPage;
        else releaseLeavingPage();
      }
    };

    // Ionic skips outlet animation builders for tab switches. Animate the
    // incoming page on its lifecycle event, after Ionic makes it visible.
    outlet.addEventListener("ionViewWillEnter", onViewWillEnter, true);
    return () => {
      outlet.removeEventListener("ionViewWillEnter", onViewWillEnter, true);
      animation?.cancel();
      leavingAnimation?.cancel();
      releaseLeavingPage();
    };
  }, [pathname]);

  const onIonTabsWillChange = ({ detail }: CustomEvent<{ tab: string }>) => {
    const from = MOBILE_TABS.indexOf(pathname.split("/")[1]);
    const to = MOBILE_TABS.indexOf(detail.tab);
    if (from < 0 || to < 0 || from === to) {
      pendingSlide.current = undefined;
      return;
    }
    const leaving = Array.from(outletRef.current?.children ?? []).find(
      (el): el is HTMLElement =>
        el instanceof HTMLElement &&
        !el.classList.contains("ion-page-hidden") &&
        !el.classList.contains("ion-page-invisible"),
    );
    pendingSlide.current = {
      tab: detail.tab,
      direction: to > from ? 1 : -1,
      leaving,
    };
  };

  return { outletRef, onIonTabsWillChange };
}
