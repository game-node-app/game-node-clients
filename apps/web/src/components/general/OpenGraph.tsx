import Head from "next/head";
import React from "react";

type Props = {
  title: string;
  description?: string;
  imageUrl?: string;
};

export const OpenGraph = ({ title, description, imageUrl }: Props) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content="https://gamenode.app" />
      <meta property="twitter:title" content="GameNode" />
      <meta property="twitter:description" content={imageUrl} />
      <meta property="twitter:image" content={imageUrl} />
    </Head>
  );
};
