import React from "react";
import {
  CenteredErrorMessage,
  CenteredLoading,
  CollectionThumbnailCard,
  DetailsBox,
  useUserLibrary,
} from "#@/components";
import { Divider, SimpleGrid, Stack } from "@mantine/core";

interface Props {
  userId: string;
}

const ProfileCollectionsPage = ({ userId }: Props) => {
  const { data, isLoading, isError, error } = useUserLibrary(userId);

  const featuredCollections =
    data?.collections.filter((collection) => collection.isFeatured) ?? [];

  const nonFeaturedCollections =
    data?.collections.filter((collection) => !collection.isFeatured) ?? [];

  return (
    <Stack className={"w-full h-full"}>
      {isLoading && <CenteredLoading message={"Loading collections..."} />}
      {isError && <CenteredErrorMessage error={error} />}
      <DetailsBox title={"Featured"} enabled={featuredCollections.length > 0}>
        <SimpleGrid
          cols={{
            base: 1,
            lg: 3,
          }}
        >
          {featuredCollections.map((collection) => (
            <CollectionThumbnailCard
              collectionId={collection.id}
              key={collection.id}
              userId={userId}
            />
          ))}
        </SimpleGrid>
        <Divider className={"w-full my-4"} />
      </DetailsBox>
      <DetailsBox title={"Public Collections"} enabled={!isError}>
        <SimpleGrid
          cols={{
            base: 1,
            lg: 3,
          }}
        >
          {nonFeaturedCollections.map((collection) => (
            <CollectionThumbnailCard
              collectionId={collection.id}
              key={collection.id}
              userId={userId}
            />
          ))}
        </SimpleGrid>
      </DetailsBox>
    </Stack>
  );
};

export { ProfileCollectionsPage };
