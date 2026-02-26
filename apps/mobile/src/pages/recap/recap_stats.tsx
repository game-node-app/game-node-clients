import React from "react";
import { AppPage } from "@/components/general/AppPage";
import { RecapStatsScreen, useUserProfile } from "@repo/ui";

interface Props {
  year: number;
  userId: string;
}

const RecapStatsPage = ({ year, userId }: Props) => {
  const profile = useUserProfile(userId);

  return (
    <AppPage title={`Recap for ${profile.data?.username} (${year})`}>
      <RecapStatsScreen userId={userId} targetYear={year} />
    </AppPage>
  );
};

export default RecapStatsPage;
