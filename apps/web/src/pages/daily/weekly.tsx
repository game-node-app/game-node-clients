import React from "react";
import Head from "next/head";
import { useTranslation } from "@repo/locales";
import { DailyWeeklyView } from "@repo/ui";

const DailyWeeklyPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>{`${t("daily.weekly.title")} - GameNode Daily`}</title>
      </Head>
      <DailyWeeklyView />
    </>
  );
};

export default DailyWeeklyPage;
