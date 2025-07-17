import React from "react";
import { Stack, Title } from "@mantine/core";
import { useRouter } from "next/router";
import {
  CenteredLoading,
  CollectionEntryDetailView,
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
    },
  });
  const profileQuery = useUserProfile(userId as string);

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
      <CollectionEntryDetailView
        userId={userId as string}
        collectionEntryId={collectionEntryId as string}
        onGoBack={handleGoBack}
      />
    </Stack>
  );
};

export default JournalDetailPage;
