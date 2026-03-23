import React from "react";
import { AppPage } from "@/components/general/AppPage";
import { RecapStatsScreen, useUserId, useUserProfile } from "@repo/ui";

interface Props {
  year: number;
  userId: string;
}

const RecapStatsPage = ({ year, userId }: Props) => {
  const ownUserId = useUserId();
  const profile = useUserProfile(userId);
  const isOwnRecap = ownUserId === userId;

  return (
    <AppPage
      title={
        isOwnRecap
          ? `Your ${year} Recap`
          : `${year} Recap for ${profile.data?.username}`
      }
    >
      <RecapStatsScreen userId={userId} targetYear={year} />
    </AppPage>
  );
};

export default RecapStatsPage;
