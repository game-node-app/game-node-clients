import {
  createAnimation,
  iosTransitionAnimation,
  mdTransitionAnimation,
  type AnimationBuilder,
} from "@ionic/react";

/** Same order as the buttons of the tab bar in `Tabs.tsx`. */
const TAB_ORDER = ["library", "explore", "home", "notifications", "profile"];

const SLIDE_DURATION_MS = 280;
const SLIDE_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

function currentTabIndex(): number {
  const segment = window.location.pathname.split("/").filter(Boolean)[0];
  return segment ? TAB_ORDER.indexOf(segment) : -1;
}

// The app boots into /home, so that is the origin of the very first switch.
let lastTabIndex = TAB_ORDER.indexOf("home");

/**
 * Router outlet transition. Switching tabs slides the new tab in from the side
 * of its position in the tab bar (instead of Ionic's default fade); any other
 * navigation (pushing a game, going back…) keeps the platform animation.
 */
export const tabSlideAnimation: AnimationBuilder = (baseEl, opts) => {
  const fromIndex = lastTabIndex;
  const toIndex = currentTabIndex();
  if (toIndex !== -1) {
    lastTabIndex = toIndex;
  }

  const isTabSwitch = fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex;

  if (!isTabSwitch || !opts.enteringEl || !opts.leavingEl) {
    const platformAnimation =
      opts.mode === "ios" ? iosTransitionAnimation : mdTransitionAnimation;
    return platformAnimation(baseEl, opts);
  }

  const dir = toIndex > fromIndex ? 1 : -1;

  const entering = createAnimation()
    .addElement(opts.enteringEl)
    .beforeRemoveClass("ion-page-invisible")
    .fromTo("transform", `translateX(${dir * 100}%)`, "translateX(0)");

  const leaving = createAnimation()
    .addElement(opts.leavingEl)
    .fromTo("transform", "translateX(0)", `translateX(${dir * -30}%)`)
    .fromTo("opacity", "1", "0.6");

  return createAnimation()
    .duration(opts.duration ?? SLIDE_DURATION_MS)
    .easing(SLIDE_EASING)
    .addAnimation([entering, leaving]);
};
