import Head from "next/head";

interface Props {
  gameData: {
    name: string;
    description?: string;
    coverImage?: string;
    id: number;
  };
}

export const GameMetaTags = ({ gameData }: Props) => {
  const title = `${gameData.name || "GameNode"} - GameNode`;
  const description =
    gameData.description || "Descubra mais sobre este jogo na GameNode";
  const image = gameData.coverImage || "/default-cover.jpg";
  const url = `https://seusite.com/game/${gameData.id}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
};
