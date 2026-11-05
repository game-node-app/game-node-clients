import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "@repo/locales";
import { DailyMode, DailyPlayView, isDailyMode } from "@repo/ui";

export const getServerSideProps = async ({
  params,
}: GetServerSidePropsContext) =>
  isDailyMode(params?.mode) ? { props: {} } : { notFound: true as const };

const DailyModePage = () => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const mode = query.mode as DailyMode;
  const puzzleId = Number(query.puzzle) || undefined;

  return (
    <>
      <Head>
        <title>{`${t(`daily.modes.${mode}.name`)} - GameNode Daily`}</title>
      </Head>
      <DailyPlayView mode={mode} puzzleId={puzzleId} />
    </>
  );
};

export default DailyModePage;
