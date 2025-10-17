import React from "react";
import {
  IonMenu,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import HomePage from "@/pages/home";
import GameSearchPage from "@/pages/search.tsx";
import { getCommonRoutes } from "@/pages/routes/getCommonRoutes";
import ExplorePage from "@/pages/explore";
import ProfilePage from "@/pages/profile/profile";
import NotificationsPage from "@/pages/notifications";
import SupertokensAuthPage from "./pages/auth";
import SupertokensAuthCallbackPage from "@/pages/auth_callback";
import { MobileSidebarMenu } from "@/components/sidebar/MobileSidebarMenu.tsx";
import {
  IconBell,
  IconHome,
  IconLibrary,
  IconTrendingUp,
  IconUser,
} from "@tabler/icons-react";
import LibraryPage from "@/pages/library/library";

const Tabs = () => {
  return (
    <IonTabs>
      <IonMenu menuId={"main-menu"} contentId="main-outlet" type="overlay">
        <MobileSidebarMenu />
      </IonMenu>
      <IonRouterOutlet
        id="main-outlet"
        onScroll={(evt) => {
          console.log("onScroll: ", evt);
        }}
      >
        <Redirect exact from="/" to="/home" />
        <Route exact path={"/m/auth"} render={() => <SupertokensAuthPage />} />
        <Route
          path={"/m/auth/callback/:provider"}
          render={(match) => {
            return (
              <SupertokensAuthCallbackPage
                provider={match.match.params.provider}
              />
            );
          }}
        />
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
        <Route exact path={`/home/search`} render={() => <GameSearchPage />} />
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
  );
};

export default Tabs;
