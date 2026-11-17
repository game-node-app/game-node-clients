import {
  DetailsBox,
  GameInfoCarousel,
  TGameOrSearchGame,
  toLibraryVisibilityLevel,
  useGames,
  useUserId,
} from "#@/components";
import { useRelatedCollectionEntries } from "#@/components/collection/collection-entry/hooks/useRelatedCollectionEntries.ts";
import { isNotFoundApiError } from "#@/util";
import { CarouselProps } from "@mantine/carousel";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";

interface Props {
  collectionEntryId: string;
  carouselProps?: CarouselProps;
}

const CollectionEntryDetailRelatedEntries = ({
  collectionEntryId,
  carouselProps,
}: Props) => {
  const { t } = useTranslation();
  const viewerId = useUserId();
  const relatedCollectionEntriesQuery =
    useRelatedCollectionEntries(collectionEntryId);

  const relatedEntries = useMemo(() => {
    if (relatedCollectionEntriesQuery.data) {
      return Object.values(relatedCollectionEntriesQuery.data).flat(1);
    }

    return [];
  }, [relatedCollectionEntriesQuery.data]);

  // Related entries belong to the entry's owner; the badge is owner-only.
  const isOwner =
    viewerId != undefined && viewerId === relatedEntries.at(0)?.libraryUserId;

  const gamesQuery = useGames(
    {
      gameIds: relatedEntries.map((entry) => entry.gameId),
      relations: {
        cover: true,
      },
    },
    false,
    { ownerUserId: relatedEntries.at(0)?.libraryUserId },
  );

  const gamesWithHref = useMemo(() => {
    return (
      gamesQuery.data?.map((game): TGameOrSearchGame => {
        const relatedCollectionEntry = relatedEntries.find(
          (entry) => entry.gameId === game.id,
        );
        return {
          ...game,
          href: `/library/${relatedCollectionEntry?.libraryUserId}/collection/entry/${relatedCollectionEntry?.id}`,
          // Owner-only badge: never expose another user's entry level.
          visibility: isOwner
            ? toLibraryVisibilityLevel(relatedCollectionEntry?.visibility)
            : undefined,
        };
      }) ?? []
    );
  }, [gamesQuery.data, relatedEntries, isOwner]);

  const isLoading =
    relatedCollectionEntriesQuery.isLoading || gamesQuery.isLoading;

  const isError = relatedCollectionEntriesQuery.isError || gamesQuery.isError;

  /*
   * Hidden related entries are omitted by the server; a 404 on the related read
   * must render nothing (the box stays disabled) rather than an error.
   */
  const isHidden = isNotFoundApiError(relatedCollectionEntriesQuery.error);

  const hasRelatedGames =
    !isHidden && relatedCollectionEntriesQuery.data != undefined;

  return (
    <DetailsBox
      withPadding
      withBorder
      title={t("collectionEntry.related.title")}
      enabled={hasRelatedGames}
      description={t("collectionEntry.related.description")}
    >
      <GameInfoCarousel
        isLoading={isLoading}
        isError={isError}
        games={gamesWithHref}
        {...carouselProps}
      />
    </DetailsBox>
  );
};

export { CollectionEntryDetailRelatedEntries };
