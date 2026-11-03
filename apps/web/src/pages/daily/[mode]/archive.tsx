import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "@repo/locales";
import { DailyArchiveView, DailyMode, isDailyMode } from "@repo/ui";

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
      <Head>
        <title>
          {`${t("daily.archive.title", { mode: t(`daily.modes.${mode}.name`) })} - GameNode Daily`}
        </title>
      </Head>
      <DailyArchiveView mode={mode} />
    </>
  );
};

export default DailyArchivePage;
