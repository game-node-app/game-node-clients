import NotificationsIcon from "@/components/notifications/NotificationsIcon.tsx";
import { closeMainMenu } from "@/util/closeMainMenu";
import { MobileSidebarMenu } from "@/components/sidebar/MobileSidebarMenu.tsx";
import { markAppReady } from "@/components/general/splash/appReady";
import ExplorePage from "@/pages/explore";
import HomePage from "@/pages/home";
import LibraryPage from "@/pages/library/library";
import NotFoundPage from "@/pages/not_found";
import NotificationsPage from "@/pages/notifications";
import { BLOG_ROUTES, getCommonRoutes } from "@/pages/routes/getCommonRoutes";
import GameSearchPage from "@/pages/search.tsx";
import WrappedHomePage from "@/pages/wrapped/wrapped_home";
import {
  LEGACY_WRAPPED_PATH,
  MOBILE_TABS,
  WRAPPED_TAB_PATH,
} from "@/util/getTabAwareHref";
import { useTabSlideAnimation } from "@/util/useTabSlideAnimation";
import {
  IonMenu,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { useTranslation } from "@repo/locales";
import {
  IconHome,
  IconLibrary,
  IconSparkles,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { matchPath, Redirect, Route, useLocation } from "react-router-dom";
import AuthPage from "./pages/auth";

/**
 * Ionic closes the menu on `touchend` (its swipe gesture), but the browser dispatches the click a
 * moment later. The dimming layer outlives the close by this long so that click lands on it and
 * not on whatever page content is underneath.
 */
const DIM_LINGER_MS = 400;
const BLOG_TAB_PATHS = Object.values(BLOG_ROUTES).map(
  (route) => `/:tab(${MOBILE_TABS.join("|")})${route}`,
);

const Tabs = () => {
  const { t } = useTranslation();
  const [dimmed, setDimmed] = useState(false);
  const [closing, setClosing] = useState(false);
  const hideTimer = useRef<number>(undefined);
  const location = useLocation();
  const { outletRef, onIonTabsWillChange } = useTabSlideAnimation(
    location.pathname,
  );
  const hideTabBar = Boolean(
    matchPath(location.pathname, { path: BLOG_TAB_PATHS, exact: true }),
  );

  // The first route has rendered: the entry splash can reveal the app.
  useEffect(() => {
    markAppReady();
  }, []);

  // Any navigation (a menu item, a deep link, back) closes the side menu. Relying only on the
  // item's onClick is fragile: the close can be dropped while the route transition starts.
  useEffect(() => {
    closeMainMenu().catch(console.error);
  }, [location.pathname]);

  return (
    <>
      {/*
        The menu pushes the whole app (pages and tab bar) to the right, like Spotify's. It has to be a
        sibling of the pushed element: `contentId` points at the wrapper around IonTabs below, not at its
        router outlet, otherwise the tab bar would stay put on top of the open menu.
      */}
      <IonMenu
        menuId={"main-menu"}
        contentId="main-content"
        type="push"
        onIonWillOpen={() => {
          window.clearTimeout(hideTimer.current);
          setClosing(false);
          setDimmed(true);
        }}
        // the shade fades with the close animation; the layer itself stays a bit longer (below)
        onIonWillClose={() => setClosing(true)}
        onIonDidClose={() => {
          hideTimer.current = window.setTimeout(
            () => setDimmed(false),
            DIM_LINGER_MS,
          );
        }}
      >
        <MobileSidebarMenu />
      </IonMenu>
      <div id="main-content" className="ion-page">
        {dimmed && (
          <div
            aria-hidden
            className={
              closing ? "gn-menu-dim gn-menu-dim--closing" : "gn-menu-dim"
            }
            onClick={() => {
              closeMainMenu().catch(console.error);
            }}
          />
        )}
        <IonTabs
          className={hideTabBar ? "gn-hide-tabbar" : undefined}
          onIonTabsWillChange={onIonTabsWillChange}
        >
          <IonRouterOutlet id="main-outlet" ref={outletRef}>
            <Redirect exact from="/" to="/home" />
            <Route exact path={"/m/auth"} render={() => <AuthPage />} />
            {/* ---- LIBRARY ROUTES ---- */}
            <Route exact path={"/library"} render={() => <LibraryPage />} />
            {getCommonRoutes("/library")}

            {/* ---- EXPLORE ROUTES ---- */}
            <Route exact path={"/explore"} render={() => <ExplorePage />} />
            <Route
              exact
              path={`/explore/search`}
              render={() => <GameSearchPage />}
            />
            {getCommonRoutes("/explore")}

            {/* ---- HOME ROUTES ---- */}
            <Route exact path={"/home"} render={() => <HomePage />} />
            <Route
              exact
              path={`/home/search`}
              render={() => <GameSearchPage />}
            />
            {getCommonRoutes("/home")}

            <Route
              exact
              path="/notifications"
              render={() => <NotificationsPage />}
            />
            {getCommonRoutes("/notifications")}
            {/* ---- WRAPPED ROUTES ---- */}
            <Route
              exact
              path={WRAPPED_TAB_PATH}
              render={() => <WrappedHomePage />}
            />
            {getCommonRoutes(WRAPPED_TAB_PATH)}
            <Route
              exact
              path={LEGACY_WRAPPED_PATH}
              render={({ location: { search, hash } }) => (
                <Redirect to={{ pathname: WRAPPED_TAB_PATH, search, hash }} />
              )}
            />

            {/*
          Catch-all. IonRouterOutlet keeps the LAST matching child and only
          falls back to pathless children when nothing else matched, so this
          must stay the final child.
        */}
            <Route render={() => <NotFoundPage />} />
          </IonRouterOutlet>
          <IonTabBar
            slot="bottom"
            inert={hideTabBar}
            aria-hidden={hideTabBar ? "true" : undefined}
          >
            <IonTabButton
              tab="library"
              href="/library"
              aria-label={t("navigation.library")}
            >
              <IconLibrary />
            </IonTabButton>
            <IonTabButton
              tab="explore"
              href="/explore"
              aria-label={t("navigation.explore")}
            >
              <IconTrendingUp />
            </IonTabButton>
            <IonTabButton
              tab="home"
              href="/home"
              aria-label={t("navigation.home")}
            >
              <IconHome />
            </IonTabButton>
            <IonTabButton
              tab="notifications"
              href="/notifications"
              aria-label={t("notifications.title")}
            >
              <NotificationsIcon />
            </IonTabButton>
            <IonTabButton
              tab="wrapped"
              href={WRAPPED_TAB_PATH}
              aria-label={t("mobile.wrapped.title")}
            >
              <IconSparkles />
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </div>
    </>
  );
};

export default Tabs;
