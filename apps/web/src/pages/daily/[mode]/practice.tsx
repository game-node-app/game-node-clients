import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "@repo/locales";
import {
  DailyPracticeMode,
  DailyPracticeView,
  isDailyPracticeMode,
} from "@repo/ui";

/** Practice only exists for Cover and Specs. */
export const getServerSideProps = async ({
  params,
}: GetServerSidePropsContext) =>
  isDailyPracticeMode(params?.mode)
    ? { props: {} }
    : { notFound: true as const };

const DailyPracticePage = () => {
  const { t } = useTranslation();
  const { query } = useRouter();
  const mode = query.mode as DailyPracticeMode;

  return (
    <>
      <Head>
        <title>{`${t(`daily.practice.${mode}.title`)} - GameNode Daily`}</title>
      </Head>
      <DailyPracticeView mode={mode} />
    </>
  );
};

export default DailyPracticePage;
