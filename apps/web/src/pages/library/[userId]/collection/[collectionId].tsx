import React from "react";
import { useRouter } from "next/router";
import { LibraryViewLayout, CollectionView } from "@repo/ui";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { CollectionsService } from "@repo/wrapper/server";
import { GetServerSidePropsContext } from "next";
import { ProfileOpenGraph } from "@/components/general/ProfileOpenGraph";
import { fetchForSeo, fetchSeoProfile, SeoProfile } from "@/util/seo";

type SeoCollection = { name: string; description: string | null };

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { userId, collectionId } = ctx.query;
  const [seoProfile, collection] = await Promise.all([
    fetchSeoProfile(userId),
    typeof collectionId === "string"
      ? fetchForSeo(() =>
          CollectionsService.collectionsControllerFindOneByIdWithPermissionsV1(
            collectionId,
          ),
        )
      : null,
  ]);
  const seoCollection: SeoCollection | null = collection
    ? { name: collection.name, description: collection.description || null }
    : null;
  return { props: { seoProfile, seoCollection } };
};

type Props = {
  seoProfile: SeoProfile | null;
  seoCollection: SeoCollection | null;
};

const Collection = ({ seoProfile, seoCollection }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userId, collectionId } = router.query;
  const username = seoProfile?.username;
  return (
    <Stack className={"lg:my-10"}>
      <ProfileOpenGraph
        profile={seoProfile}
        title={
          seoCollection
            ? t("seo.collection.title", {
                collection: seoCollection.name,
                username,
              })
            : t("seo.library.title", { username })
        }
        description={
          seoCollection?.description ||
          t("seo.collection.description", { username })
        }
      />
      <LibraryViewLayout
        userId={userId as string | undefined}
        collectionId={collectionId as string | undefined}
      >
        <CollectionView
          libraryUserId={userId as string}
          collectionId={collectionId as string}
        />
      </LibraryViewLayout>
    </Stack>
  );
};

export default Collection;
