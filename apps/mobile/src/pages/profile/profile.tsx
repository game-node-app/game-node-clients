import {
  IonFab,
  IonFabButton,
  IonRefresher,
  IonRefresherContent,
  useIonRouter,
} from "@ionic/react";
import React from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { IconSettings } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import {
  CenteredLoading,
  ProfileUserInfoWithBanner,
  ProfileViewContent,
  useUserId,
  useUserProfile,
} from "@repo/ui";
import { AppPage } from "@/components/general/AppPage";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  userId?: string;
}

const ProfilePage = ({ userId }: Props) => {
  const queryClient = useQueryClient();
  const ownUserId = useUserId();
  const userIdToUse =
    userId == undefined && ownUserId != undefined ? ownUserId : userId;
  const isOwnProfile = userIdToUse === ownUserId;

  const {
    routeInfo: { pathname },
  } = useIonRouter();

  const isInTab = pathname.split("/").length === 2;

  const profileQuery = useUserProfile(userId);

  return (
    <AppPage
      withMenuButton
      contentProps={{
        fixedSlotPlacement: "before",
      }}
    >
      <IonRefresher
        slot="fixed"
        onIonRefresh={async (event) => {
          const promises: Promise<unknown>[] = [
            queryClient.invalidateQueries({
              queryKey: ["userProfile", userIdToUse],
            }),
            queryClient.invalidateQueries({
              queryKey: ["collection-entries", "favorites", userIdToUse],
            }),
            queryClient.invalidateQueries({
              queryKey: ["playtime", "user", userIdToUse],
            }),
            queryClient.invalidateQueries({
              queryKey: ["achievement", "obtained", "all", userIdToUse],
            }),
            queryClient.invalidateQueries({
              queryKey: ["journal", "overview", userIdToUse],
            }),
          ];

          await Promise.all(promises);
          event.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <SessionAuth requireAuth={userId == undefined}>
        {profileQuery.isLoading && <CenteredLoading />}
        {userIdToUse && (
          <ProfileUserInfoWithBanner userId={userIdToUse}>
            <ProfileViewContent userId={userIdToUse} />
          </ProfileUserInfoWithBanner>
        )}
      </SessionAuth>
    </AppPage>
  );
};

export default ProfilePage;
