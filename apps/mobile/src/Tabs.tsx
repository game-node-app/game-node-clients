import { closeMainMenu } from "@/util/closeMainMenu";
import { MobileSidebarMenu } from "@/components/sidebar/MobileSidebarMenu.tsx";
import ExplorePage from "@/pages/explore";
import HomePage from "@/pages/home";
import LibraryPage from "@/pages/library/library";
import NotFoundPage from "@/pages/not_found";
import NotificationsPage from "@/pages/notifications";
import ProfilePage from "@/pages/profile/profile";
import { getCommonRoutes } from "@/pages/routes/getCommonRoutes";
import GameSearchPage from "@/pages/search.tsx";
import {
  IonMenu,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import {
  IconBell,
  IconHome,
  IconLibrary,
  IconTrendingUp,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Redirect, Route, useLocation } from "react-router-dom";
import AuthPage from "./pages/auth";

/**
 * Ionic closes the menu on `touchend` (its swipe gesture), but the browser dispatches the click a
 * moment later. The dimming layer outlives the close by this long so that click lands on it and
 * not on whatever page content is underneath.
 */
const DIM_LINGER_MS = 400;

const Tabs = () => {
  const [dimmed, setDimmed] = useState(false);
  const hideTimer = useRef<number>(undefined);
  const location = useLocation();

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
          setDimmed(true);
        }}
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
            className="gn-menu-dim"
            onClick={() => {
              closeMainMenu().catch(console.error);
            }}
          />
        )}
        <IonTabs>
          <IonRouterOutlet
            id="main-outlet"
            onScroll={(evt) => {
              console.log("onScroll: ", evt);
            }}
          >
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
            {/* ---- PROFILE ROUTES ---- */}
            <Route exact path={"/profile"} render={() => <ProfilePage />} />
            {getCommonRoutes("/profile")}

            {/*
          Catch-all. IonRouterOutlet keeps the LAST matching child and only
          falls back to pathless children when nothing else matched, so this
          must stay the final child.
        */}
            <Route render={() => <NotFoundPage />} />
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="library" href="/library">
              <IconLibrary />
            </IonTabButton>
            <IonTabButton tab="explore" href="/explore">
              <IconTrendingUp />
            </IonTabButton>
            <IonTabButton tab="home" href="/home">
              <IconHome />
            </IonTabButton>
            <IonTabButton tab="notifications" href="/notifications">
              <IconBell />
            </IonTabButton>
            <IonTabButton tab="profile" href="/profile">
              <IconUser />
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </div>
    </>
  );
};

export default Tabs;
