import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import React from "react";
import { Container } from "@mantine/core";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { IconSettings } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import {
  CenteredLoading,
  ProfileUserInfoWithBanner,
  ProfileViewContent,
  usePlaytimeForUser,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import { FindAllPlaytimeFiltersDto } from "@repo/wrapper/server";

interface Props {
  userId?: string;
}

const ProfilePage = ({ userId }: Props) => {
  const ownUserId = useUserId();
  const userIdToUse =
    userId == undefined && ownUserId != undefined ? ownUserId : userId;
  const isOwnProfile = userIdToUse === ownUserId;

  const {
    routeInfo: { pathname },
  } = useIonRouter();

  const isInTab = pathname.split("/").length === 2;

  const profileQuery = useUserProfile(userId);

  const playtime = usePlaytimeForUser({
    userId: userIdToUse!,
    offset: 0,
    limit: 5,
    period: FindAllPlaytimeFiltersDto.period.ALL,
  });

  const hasPlaytimeInfo =
    playtime.data != undefined && playtime.data.data.length > 0;

  const showPlaytimeInfo = hasPlaytimeInfo || ownUserId === userIdToUse;

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
                <IonTitle>
                  {profileQuery.data?.username}&apos;s profile
                </IonTitle>
              )}
            </IonToolbar>
          </IonHeader>
        )}

        <IonContent className={"ion-padding"}>
          {isOwnProfile && (
            <IonFab
              slot="fixed"
              horizontal="end"
              vertical="bottom"
              className={"me-2 mb-2"}
            >
              <Link to={getTabAwareHref("/preferences")}>
                <IonFabButton>
                  <IconSettings />
                </IonFabButton>
              </Link>
            </IonFab>
          )}
          {profileQuery.isLoading && <CenteredLoading />}
          {userIdToUse && (
            <ProfileUserInfoWithBanner userId={userIdToUse}>
              <ProfileViewContent userId={userIdToUse} />
            </ProfileUserInfoWithBanner>
          )}
        </IonContent>
      </SessionAuth>
    </IonPage>
  );
};

export default ProfilePage;
