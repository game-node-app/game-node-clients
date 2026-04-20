import Head from "next/head";

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
    </Head>
  );
};
