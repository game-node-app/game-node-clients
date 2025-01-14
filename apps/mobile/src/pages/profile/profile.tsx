import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonPage,
    IonProgressBar,
    IonTitle,
    IonToolbar,
    useIonRouter,
} from "@ionic/react";
import React from "react";
import useUserId from "@/components/auth/hooks/useUserId";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import ProfileUserInfoWithBanner from "@/components/profile/view/ProfileUserInfoWithBanner";
import ProfileViewNavbar from "@/components/profile/view/ProfileViewNavbar";
import { Box, Container, Divider } from "@mantine/core";
import ProfileFavoriteGames from "@/components/profile/view/ProfileFavoriteGames";
import ProfileStatsSimpleOverview from "@/components/profile/view/ProfileStatsSimpleOverview";
import RecentActivityList from "@/components/activity/RecentActivityList";
import CenteredLoading from "@/components/general/CenteredLoading";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { IconAdjustmentsCog, IconSettings } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";

interface Props {
    userId?: string;
}

const ProfilePage = ({ userId }: Props) => {
    const ownUserId = useUserId();
    const userIdToUse = userId == undefined && ownUserId != undefined ? ownUserId : userId;
    const isOwnProfile = userIdToUse === ownUserId;

    const {
        routeInfo: { pathname },
    } = useIonRouter();

    const isInTab = pathname.split("/").length === 2;

    const profileQuery = useUserProfile(userId);

    return (
        <IonPage>
            <SessionAuth requireAuth={userId == undefined}>
                {isInTab && isOwnProfile ? null : (
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot={"start"}>
                                <IonBackButton />
                            </IonButtons>
                            {isOwnProfile ? (
                                <IonTitle>Your profile</IonTitle>
                            ) : (
                                <IonTitle>{profileQuery.data?.username}&apos;s profile</IonTitle>
                            )}
                        </IonToolbar>
                    </IonHeader>
                )}

                <IonContent>
                    {isOwnProfile && (
                        <IonFab slot="fixed" horizontal="end" vertical="bottom" className={"me-2 mb-2"}>
                            <Link to={getTabAwareHref("/preferences")}>
                                <IonFabButton>
                                    <IconSettings />
                                </IonFabButton>
                            </Link>
                        </IonFab>
                    )}
                    <Container fluid className="my-4">
                        {profileQuery.isLoading && <CenteredLoading />}

                        {userIdToUse && (
                            <ProfileUserInfoWithBanner userId={userIdToUse}>
                                <ProfileViewNavbar userId={userIdToUse} />
                                <Box className={"w-full mb-4 mt-4"}>
                                    <ProfileFavoriteGames userId={userIdToUse} />
                                </Box>
                                <Divider className={"w-full mt-6 mb-2"} label={"Stats"} />
                                <ProfileStatsSimpleOverview userId={userIdToUse} />
                                <Divider className={"w-full mt-6 mb-2"} label={"Recent activity"} />
                                <RecentActivityList userId={userIdToUse} limit={7} />
                            </ProfileUserInfoWithBanner>
                        )}
                    </Container>
                </IonContent>
            </SessionAuth>
        </IonPage>
    );
};

export default ProfilePage;
