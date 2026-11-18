import { AppPage } from "@/components/general/AppPage";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { useTranslation } from "@repo/locales";
import { ProfileViewContent, SessionAuth, useUserId } from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  userId?: string;
}

const ProfilePage = ({ userId }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const ownUserId = useUserId();
  const userIdToUse = userId ?? ownUserId;

  return (
    <AppPage
      withMenuButton
      title={t("navigation.profile")}
      contentProps={{
        fixedSlotPlacement: "before",
      }}
    >
      <IonRefresher
        slot="fixed"
        onIonRefresh={async (event) => {
          const queryKeys = [
            ["userProfile", userIdToUse],
            ["user-level", userIdToUse],
            ["user", "follow", "info"],
            ["collection-entries", "favorites", userIdToUse],
            ["collection-entries", "all", userIdToUse],
            ["library", userIdToUse],
            ["connections", "user", userIdToUse],
            ["playtime", "user", userIdToUse],
            ["achievement", "obtained", "all", userIdToUse],
            ["achievements", "v2", userIdToUse],
            ["achievements", "progress", userIdToUse],
            ["game", "achievements", "obtained", userIdToUse],
            ["journal", "overview", userIdToUse],
            ["journal", "achievements", "obtained", userIdToUse],
            ["reviews", "all", userIdToUse],
            ["activities", "latest", userIdToUse],
            ["posts", "infinite", undefined, undefined, userIdToUse],
          ];

          try {
            if (userIdToUse) {
              await Promise.all(
                queryKeys.map((queryKey) =>
                  queryClient.invalidateQueries({ queryKey }),
                ),
              );
            }
          } finally {
            event.detail.complete();
          }
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <SessionAuth requireAuth={userId == undefined}>
        {userIdToUse && (
          <ProfileViewContent key={userIdToUse} userId={userIdToUse} />
        )}
      </SessionAuth>
    </AppPage>
  );
};

export default ProfilePage;
