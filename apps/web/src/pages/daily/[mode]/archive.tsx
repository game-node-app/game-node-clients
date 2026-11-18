import React from "react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "@repo/locales";
import { DailyArchiveView, DailyMode, isDailyMode } from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";

export const getServerSideProps = async ({
  params,
}: GetServerSidePropsContext) =>
  isDailyMode(params?.mode) ? { props: {} } : { notFound: true as const };

const DailyArchivePage = () => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const mode = query.mode as DailyMode;

  return (
    <>
      <OpenGraph
        title={`${t("daily.archive.title", { mode: t(`daily.modes.${mode}.name`) })} - GameNode Daily`}
        description={t("seo.daily.description")}
      />
      <DailyArchiveView mode={mode} />
    </>
  );
};

export default DailyArchivePage;
