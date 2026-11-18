import { useIonViewWillEnter, useIonViewWillLeave } from "@ionic/react";

/**
 * Pages currently asking for the tab bar to be hidden. A counter instead of a plain toggle:
 * between two hiding pages (blog feed -> post) Ionic may fire the new page's enter before the
 * old page's leave, and the bar must not reappear in between.
 */
let hiders = 0;

const sync = () => {
  document.body.classList.toggle("gn-hide-tabbar", hiders > 0);
};

/**
 * Slides the floating tab bar out of view (`body.gn-hide-tabbar`, see globals.css) while the
 * calling page is the active one. Call it from a page rendered by an Ionic route.
 */
export const useHideTabBar = () => {
  useIonViewWillEnter(() => {
    hiders += 1;
    sync();
  });
  useIonViewWillLeave(() => {
    hiders = Math.max(0, hiders - 1);
    sync();
  });
};
