import React, { Suspense } from "react";
import { IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from "@ionic/react";
import CenteredLoading from "@/components/general/CenteredLoading";
import { Redirect, Route } from "react-router-dom";
import HomePage from "@/pages/home";
import SearchResultsPage from "@/pages/search_results";
import { getCommonRoutes } from "@/pages/routes/getCommonRoutes";
import ExplorePage from "@/pages/explore";
import ProfilePage from "@/pages/profile/profile";
import LibraryPage from "@/pages/library";
import NotificationsPage from "@/pages/notifications";
import PreferencesPage from "@/pages/preferences";
import { IconLibrary, IconRouteAltLeft, IconUser } from "@tabler/icons-react";
import NotificationsIcon from "@/components/notifications/item/NotificationsIcon";
import SupertokensAuthPage from "./pages/auth";
import SupertokensAuthCallbackPage from "@/pages/auth_callback";

const Tabs = () => {
    return (
        <IonTabs>
            <IonRouterOutlet>
                <Suspense fallback={<CenteredLoading message={"Loading page..."} />}>
                    <Route exact path={"/m/auth"}>
                        <SupertokensAuthPage />
                    </Route>
                    <Route
                        path={"/m/auth/callback/:provider"}
                        render={(match) => {
                            return <SupertokensAuthCallbackPage provider={match.match.params.provider} />;
                        }}
                    />
                    {/* ---- LIBRARY ROUTES ---- */}
                    <Route exact path="/library">
                        <LibraryPage />
                    </Route>
                    {getCommonRoutes("/library")}

                    {/* ---- EXPLORE ROUTES ---- */}
                    <Route exact path={"/explore"}>
                        <ExplorePage />
                    </Route>
                    <Route exact path={`/explore/search_results`}>
                        <SearchResultsPage />
                    </Route>
                    {getCommonRoutes("/explore")}

                    {/* ---- HOME ROUTES ---- */}
                    <Route exact path={"/"}>
                        <Redirect to={"/home"} push={false} />
                    </Route>
                    <Route exact path={"/home"}>
                        <HomePage />
                    </Route>
                    <Route exact path={`/home/search_results`}>
                        <SearchResultsPage />
                    </Route>
                    {getCommonRoutes("/home")}

                    <Route exact path="/notifications">
                        <NotificationsPage />
                    </Route>
                    {getCommonRoutes("/notifications")}
                    {/* ---- PROFILE ROUTES ---- */}
                    <Route exact path={"/profile"}>
                        <ProfilePage />
                    </Route>
                    <Route exact path="/profile/preferences">
                        <PreferencesPage />
                    </Route>
                    {getCommonRoutes("/profile")}
                </Suspense>
            </IonRouterOutlet>
            <IonTabBar slot="bottom">
                <IonTabButton tab="library" href="/library">
                    <IconLibrary aria-hidden={"true"} />
                </IonTabButton>
                <IonTabButton tab="explore" href="/explore">
                    <IconRouteAltLeft aria-hidden={"true"} />
                </IonTabButton>
                <IonTabButton tab={"home"} href={"/home"}></IonTabButton>
                <IonTabButton tab="notifications" href="/notifications">
                    <NotificationsIcon />
                </IonTabButton>
                <IonTabButton tab="profile" href="/profile">
                    <IconUser aria-hidden={"true"} />
                </IonTabButton>
            </IonTabBar>
        </IonTabs>
    );
};

export default Tabs;
