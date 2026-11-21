import React from "react";
import { DailyHomeView } from "@repo/ui";
import { useTranslation } from "@repo/locales";
import { OpenGraph } from "@/components/general/OpenGraph";

const DailyPage = () => {
  const { t } = useTranslation();
  return (
    <>
      <OpenGraph
        title={t("daily.title")}
        description={t("seo.daily.description")}
      />
      <DailyHomeView />
    </>
  );
};

export default DailyPage;
