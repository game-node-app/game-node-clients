import React from "react";
import { AppPage } from "@/components/general/AppPage";
import { RecapStatsScreen, useUserId, useUserProfile } from "@repo/ui";
import { useTranslation } from "@repo/locales";

interface Props {
  year: number;
  userId: string;
}

const RecapStatsPage = ({ year, userId }: Props) => {
  const { t } = useTranslation();
  const ownUserId = useUserId();
  const profile = useUserProfile(userId);
  const isOwnRecap = ownUserId === userId;

  return (
    <AppPage
      title={
        isOwnRecap
          ? t("mobile.recap.titleOwn", { year })
          : t("mobile.recap.titleFor", {
              year,
              username: profile.data?.username ?? "",
            })
      }
    >
      <RecapStatsScreen userId={userId} targetYear={year} />
    </AppPage>
  );
};

export default RecapStatsPage;
