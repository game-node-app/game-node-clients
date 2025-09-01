import Head from "next/head";
import React from "react";

const HeaderOpenGraph = ({ title, cover, description }) => {
  return (
    <>
      <Head>
        <title>{`${title} - GameNode`}</title>
        <meta property="og:title" content={`${title} - GameNode`} />
        <meta property="og:image" content={cover} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="GameNode" />
      </Head>
    </>
  );
};

export default HeaderOpenGraph;
