import React from "react";
import {
  CenteredErrorMessage,
  CenteredLoading,
  CollectionThumbnailCard,
  DetailsBox,
  useUserLibrary,
} from "#@/components";
import { Divider, SimpleGrid, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
}

const ProfileCollectionsPage = ({ userId }: Props) => {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useUserLibrary(userId);

  const featuredCollections =
    data?.collections.filter((collection) => collection.isFeatured) ?? [];

  const nonFeaturedCollections =
    data?.collections.filter((collection) => !collection.isFeatured) ?? [];

  return (
    <Stack className={"w-full h-full"}>
      {isLoading && (
        <CenteredLoading message={t("profile.collections.loading")} />
      )}
      {isError && <CenteredErrorMessage error={error} />}
      <DetailsBox
        title={t("profile.collections.featured")}
        enabled={featuredCollections.length > 0}
      >
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
            />
          ))}
        </SimpleGrid>
        <Divider className={"w-full my-4"} />
      </DetailsBox>
      <DetailsBox title={t("profile.collections.public")} enabled={!isError}>
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
            />
          ))}
        </SimpleGrid>
      </DetailsBox>
    </Stack>
  );
};

export { ProfileCollectionsPage };
