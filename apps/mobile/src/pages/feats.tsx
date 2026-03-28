import React from "react";
import { AchievementsScreen, useUserProfile } from "@repo/ui";
import { AppPage } from "@/components/general/AppPage.tsx";

interface Props {
  userId: string;
}

const AchievementsPage = ({ userId }: Props) => {
  const profileQuery = useUserProfile(userId);
  return (
    <AppPage withSearch>
      <AchievementsScreen targetUserId={userId} />
    </AppPage>
  );
};

export default AchievementsPage;
