import React, { useEffect } from "react";
import { AppPage } from "@/components/general/AppPage";
import {
  JournalObtainedAchievementsView,
  useRouter,
  useUserId,
} from "@repo/ui";

interface Props {
  userId: string | undefined;
}

const JournalAchievementsPage = ({ userId }: Props) => {
  const ownUserId = useUserId();
  const userIdToUse = userId || ownUserId;

  return (
    <AppPage withSearch>
      <JournalObtainedAchievementsView userId={userIdToUse!} withUserInfo />
    </AppPage>
  );
};

export default JournalAchievementsPage;
