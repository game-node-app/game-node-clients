import React from "react";
import { AppPage } from "@/components/general/AppPage.tsx";
import {
  CollectionThumbnailCard,
  useUserId,
  useUserLibrary,
  useUserProfile,
} from "@repo/ui";
import { Stack, Text } from "@mantine/core";

interface Props {
  userId: string;
}

const LibraryCollectionsPage = ({ userId }: Props) => {
  const ownUserId = useUserId();
  const { data: library } = useUserLibrary(userId);
  const { data: profile } = useUserProfile(userId);
  const collections = library?.collections ?? [];

  const isOwnLibrary = userId === ownUserId;

  return (
    <AppPage withSearch>
      <Text className={"text-xl font-bold mb-5"}>
        {isOwnLibrary ? "Your" : `${profile?.username}'`} collections
      </Text>
      <Stack>
        {collections.map((collection) => (
          <CollectionThumbnailCard
            key={`${userId}-${collection.id}`}
            collectionId={collection.id}
          />
        ))}
      </Stack>
    </AppPage>
  );
};

export default LibraryCollectionsPage;
