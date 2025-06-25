import React from "react";
import { CollectionPreviewCard, useUserLibrary } from "#@/components";
import { SimpleGrid, Stack } from "@mantine/core";

interface Props {
  userId: string;
}

const ProfileCollectionsPage = ({ userId }: Props) => {
  const libraryQuery = useUserLibrary(userId);

  return (
    <Stack className={"w-full h-full"}>
      <SimpleGrid
        cols={{
          base: 1,
          lg: 3,
        }}
      >
        {libraryQuery.data?.collections?.map((collection) => (
          <CollectionPreviewCard
            collectionId={collection.id}
            key={collection.id}
            userId={userId}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export { ProfileCollectionsPage };
