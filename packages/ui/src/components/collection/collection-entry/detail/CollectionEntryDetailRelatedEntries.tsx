import React, { useMemo } from "react";
import { useRelatedCollectionEntries } from "#@/components/collection/collection-entry/hooks/useRelatedCollectionEntries.ts";
import {
  DetailsBox,
  GameInfoCarousel,
  TGameOrSearchGame,
  useGames,
} from "#@/components";

interface Props {
  collectionEntryId: string;
}

const CollectionEntryDetailRelatedEntries = ({ collectionEntryId }: Props) => {
  const relatedCollectionEntriesQuery =
    useRelatedCollectionEntries(collectionEntryId);

  const relatedEntries = useMemo(() => {
    if (relatedCollectionEntriesQuery.data) {
      return Object.values(relatedCollectionEntriesQuery.data).flat(1);
    }

    return [];
  }, [relatedCollectionEntriesQuery.data]);

  const gamesQuery = useGames({
    gameIds: relatedEntries.map((entry) => entry.gameId),
    relations: {
      cover: true,
    },
  });

  const gamesWithHref = useMemo(() => {
    return (
      gamesQuery.data?.map((game): TGameOrSearchGame => {
        const relatedCollectionEntry = relatedEntries.find(
          (entry) => entry.gameId === game.id,
        );
        return {
          ...game,
          href: `/library/${relatedCollectionEntry?.libraryUserId}/collection/entry/${relatedCollectionEntry?.id}`,
        };
      }) ?? []
    );
  }, [gamesQuery.data, relatedEntries]);

  const isLoading =
    relatedCollectionEntriesQuery.isLoading || gamesQuery.isLoading;

  const isError = relatedCollectionEntriesQuery.isError || gamesQuery.isError;

  const isEmpty = gamesWithHref.length === 0;

  const hasRelatedGames = relatedCollectionEntriesQuery.data != undefined;

  return (
    <DetailsBox
      withPadding
      withBorder
      title={"Related Content"}
      enabled={hasRelatedGames}
      description={"Owned DLCs and expansions"}
    >
      <GameInfoCarousel
        isLoading={isLoading}
        isError={isError}
        games={gamesWithHref}
        slideSize={{
          base: "40%",
        }}
      />
    </DetailsBox>
  );
};

export { CollectionEntryDetailRelatedEntries };
