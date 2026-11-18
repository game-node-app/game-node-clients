import React from "react";
import { useTranslation } from "@repo/locales";
import { DailyWeeklyView } from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";

const DailyWeeklyPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <OpenGraph
        title={`${t("daily.weekly.title")} - GameNode Daily`}
        description={t("seo.daily.description")}
      />
      <DailyWeeklyView />
    </>
  );
};

export default DailyWeeklyPage;
