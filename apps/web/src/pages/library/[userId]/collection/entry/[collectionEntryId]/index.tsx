import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  CenteredLoading,
  CollectionEntryDetailView,
  useCollectionEntry,
  useGame,
  useUserProfile,
} from "@repo/ui";
import {
  CollectionsEntriesService,
  GameRepositoryService,
} from "@repo/wrapper/server";
import { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { OpenGraph } from "@/components/general/OpenGraph";
import {
  fetchForSeo,
  fetchSeoProfile,
  gameCoverUrl,
  SeoProfile,
} from "@/util/seo";

type SeoGame = { name: string; coverUrl: string | null };

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { userId, collectionEntryId } = ctx.query;
  const [seoProfile, entry] = await Promise.all([
    fetchSeoProfile(userId),
    typeof collectionEntryId === "string"
      ? fetchForSeo(() =>
          CollectionsEntriesService.collectionsEntriesControllerFindEntryByIdV1(
            collectionEntryId,
          ),
        )
      : null,
  ]);
  const game = entry
    ? await fetchForSeo(() =>
        GameRepositoryService.gameRepositoryControllerFindOneByIdV1(
          entry.gameId,
          { relations: { cover: true } },
        ),
      )
    : null;
  const seoGame: SeoGame | null = game
    ? { name: game.name, coverUrl: gameCoverUrl(game.cover?.url) }
    : null;
  return { props: { seoProfile, seoGame } };
};

type Props = { seoProfile: SeoProfile | null; seoGame: SeoGame | null };

const JournalDetailPage = ({ seoProfile, seoGame }: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { collectionEntryId, userId } = router.query;

  const collectionEntryQuery = useCollectionEntry(collectionEntryId as string);

  const gameId = collectionEntryQuery.data?.gameId;

  const gameQuery = useGame(
    gameId,
    {
      relations: {
        cover: true,
        screenshots: true,
      },
    },
    { ownerUserId: typeof userId === "string" ? userId : undefined },
  );

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

  const values = { game: seoGame?.name, username: seoProfile?.username };

  return (
    <Stack className={"w-full"}>
      {seoGame && seoProfile ? (
        <OpenGraph
          title={t("seo.entry.title", values)}
          description={t("seo.entry.description", values)}
          imageUrl={seoGame.coverUrl}
          imageAlt={seoGame.name}
        />
      ) : (
        gameQuery.data &&
        profileQuery.data && (
          <Head>
            <title>
              {t("seo.entry.title", {
                game: gameQuery.data.name,
                username: profileQuery.data.username,
              })}
            </title>
          </Head>
        )
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
