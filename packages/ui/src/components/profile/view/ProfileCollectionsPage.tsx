import {
  CenteredErrorMessage,
  CenteredLoading,
  CollectionThumbnailCard,
  DetailsBox,
  LibraryHiddenState,
  useIsLibraryHidden,
  useUserLibrary,
} from "#@/components";
import { filterVisibleCollections } from "#@/components/library/util/filterVisibleCollections";
import { Divider, SimpleGrid, Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
}

const ProfileCollectionsPage = ({ userId }: Props) => {
  const { t } = useTranslation();
  const { isHidden, isOwner, profile } = useIsLibraryHidden(userId);
  const { data, isLoading, isError, error } = useUserLibrary(userId);

  if (isHidden) {
    return <LibraryHiddenState profile={profile} />;
  }

  // A non-owner never receives private collections on a fresh read; filtering
  // protects lists rendered from a cache filled in another permission state.
  const visibleCollections = filterVisibleCollections(
    data?.collections,
    isOwner,
  );

  const featuredCollections =
    visibleCollections?.filter((collection) => collection.isFeatured) ?? [];

  const nonFeaturedCollections =
    visibleCollections?.filter((collection) => !collection.isFeatured) ?? [];

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
