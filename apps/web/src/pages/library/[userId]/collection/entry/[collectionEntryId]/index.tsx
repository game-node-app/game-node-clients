import React from "react";
import { Stack, Title } from "@mantine/core";
import { useRouter } from "next/router";
import {
  CenteredLoading,
  CollectionEntryDetailView,
  getSizedImageUrl,
  ImageSize,
  useCollectionEntry,
  useGame,
  useUserProfile,
} from "@repo/ui";
import Head from "next/head";

const JournalDetailPage = () => {
  const router = useRouter();
  const { collectionEntryId, userId } = router.query;

  const collectionEntryQuery = useCollectionEntry(collectionEntryId as string);

  const gameId = collectionEntryQuery.data?.gameId;

  const gameQuery = useGame(gameId, {
    relations: {
      cover: true,
      screenshots: true,
    },
  });

  const profileQuery = useUserProfile(userId as string);

  const backgroundImageUrl = getSizedImageUrl(
    gameQuery.data?.screenshots?.at(0)?.url,
    ImageSize.SCREENSHOT_HUGE,
  );

  const handleGoBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(`/library/${userId}`);
    }
  };

  if (typeof userId !== "string" || typeof collectionEntryId !== "string") {
    return <CenteredLoading />;
  }

  return (
    <Stack className={"w-full"}>
      {gameQuery.data && profileQuery.data && (
        <Head>
          <title>
            {gameQuery.data?.name} - {profileQuery.data?.username} - GameNode
          </title>
        </Head>
      )}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "60vh",
          backgroundImage: `
              linear-gradient(180deg,rgba(0, 0, 0, 0.1) 0%, rgba(10, 10, 10, 0.6) 34%, rgba(25, 25, 25, 1) 87%), 
              url(${backgroundImageUrl})
            `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: 0,
          opacity: 0.6,
        }}
      />
      <CollectionEntryDetailView
        userId={userId as string}
        collectionEntryId={collectionEntryId as string}
        onGoBack={handleGoBack}
        className={"w-full z-10"}
      />
    </Stack>
  );
};

export default JournalDetailPage;
