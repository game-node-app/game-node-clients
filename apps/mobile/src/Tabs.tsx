import React, { useCallback } from "react";
import {
  IonContent,
  IonHeader,
  IonIcon,
  IonMenu,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import HomePage from "@/pages/home";
import GameSearchPage from "@/pages/search.tsx";
import { getCommonRoutes } from "@/pages/routes/getCommonRoutes";
import ExplorePage from "@/pages/explore";
import ProfilePage from "@/pages/profile/profile";
import LibraryPage from "@/pages/library";
import NotificationsPage from "@/pages/notifications";
import PreferencesPage from "@/pages/preferences";
import SupertokensAuthPage from "./pages/auth";
import SupertokensAuthCallbackPage from "@/pages/auth_callback";
import ActivityPage from "@/pages/activity";
import { QueryProgressBar } from "@/components/general/QueryProgressBar.tsx";

const Tabs = () => {
  return (
    <IonTabs>
      <IonMenu contentId="main-outlet" type="overlay">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Menu Content</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          This is the menu content.
        </IonContent>
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
        {/* ---- ACTIVITY ROUTES ---- */}
        <Route exact path={"/activity"} render={() => <ActivityPage />} />
        {getCommonRoutes("/activity")}

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
        <IonTabButton tab="activity" href="/activity">
          <IonIcon src={"/img/icon/icon_zap.svg"} aria-hidden={"true"} />
        </IonTabButton>
        <IonTabButton tab="explore" href="/explore">
          <IonIcon src={"/img/icon/icon_trending.svg"} aria-hidden={"true"} />
        </IonTabButton>
        <IonTabButton tab="home" href={"/home"}>
          <IonIcon src={"/img/icon/icon_house.svg"} aria-hidden={"true"} />
        </IonTabButton>
        <IonTabButton tab="notifications" href="/notifications">
          <IonIcon
            src={"/img/icon/icon_notification.svg"}
            aria-hidden={"true"}
          />
        </IonTabButton>
        <IonTabButton tab="profile" href="/profile">
          <IonIcon src={"/img/icon/icon_user.svg"} aria-hidden={"true"} />
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
