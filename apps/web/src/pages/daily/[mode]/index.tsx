import React from "react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "@repo/locales";
import { DailyMode, DailyPlayView, isDailyMode } from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";

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
      <OpenGraph
        title={`${t(`daily.modes.${mode}.name`)} - GameNode Daily`}
        description={t(`daily.modes.${mode}.description`)}
      />
      <DailyPlayView mode={mode} puzzleId={puzzleId} />
    </>
  );
};

export default DailyModePage;
