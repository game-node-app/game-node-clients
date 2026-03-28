import React from "react";
import { AppPage } from "@/components/general/AppPage";
import { JournalObtainedAchievementsView, useUserId } from "@repo/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import { useQueryClient } from "@tanstack/react-query";

interface Props {
  userId: string | undefined;
}

const JournalAchievementsPage = ({ userId }: Props) => {
  const queryClient = useQueryClient();
  const ownUserId = useUserId();
  const userIdToUse = userId || ownUserId;

  return (
    <AppPage withSearch>
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          const promises: Promise<unknown>[] = [
            queryClient.invalidateQueries({
              queryKey: ["journal", "achievements", "obtained"],
            }),
          ];

          await Promise.all(promises);

          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <SessionAuth requireAuth={userId == undefined || userId === "undefined"}>
        {userIdToUse && (
          <JournalObtainedAchievementsView userId={userIdToUse} withUserInfo />
        )}
      </SessionAuth>
    </AppPage>
  );
};

export default JournalAchievementsPage;
