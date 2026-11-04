import React from "react";
import Head from "next/head";
import { DailyHomeView } from "@repo/ui";

const DailyPage = () => {
  return (
    <>
      <Head>
        <title>GameNode Daily</title>
      </Head>
      <DailyHomeView />
    </>
  );
};

export default DailyPage;
