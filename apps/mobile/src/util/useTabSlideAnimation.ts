import { MOBILE_TABS } from "@/util/getTabAwareHref";
import type { IonRouterOutlet } from "@ionic/react";
import { type ComponentRef, useLayoutEffect, useRef } from "react";

export function useTabSlideAnimation(pathname: string) {
  const outletRef = useRef<ComponentRef<typeof IonRouterOutlet>>(null);
  const pendingSlide = useRef<{ tab: string; offset: number }>(undefined);

  useLayoutEffect(() => {
    const outlet = outletRef.current;
    if (!outlet) return;

    const currentTab = pathname.split("/")[1];
    if (pendingSlide.current?.tab !== currentTab)
      pendingSlide.current = undefined;

    let animation: Animation | undefined;
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

      animation = target.animate?.(
        [
          { transform: `translateX(${slide.offset}px)`, opacity: 0 },
          { transform: "translateX(0)", opacity: 1 },
        ],
        { duration: 280, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
      );
    };

    // Ionic skips outlet animation builders for tab switches. Animate the
    // incoming page on its lifecycle event, after Ionic makes it visible.
    outlet.addEventListener("ionViewWillEnter", onViewWillEnter, true);
    return () => {
      outlet.removeEventListener("ionViewWillEnter", onViewWillEnter, true);
      animation?.cancel();
    };
  }, [pathname]);

  const onIonTabsWillChange = ({ detail }: CustomEvent<{ tab: string }>) => {
    const from = MOBILE_TABS.indexOf(pathname.split("/")[1]);
    const to = MOBILE_TABS.indexOf(detail.tab);
    pendingSlide.current =
      from >= 0 && to >= 0 && from !== to
        ? { tab: detail.tab, offset: to > from ? 32 : -32 }
        : undefined;
  };

  return { outletRef, onIonTabsWillChange };
}
