import {
  DetailsBox,
  LibraryHiddenState,
  toLibraryVisibilityLevel,
  useIsLibraryHidden,
  useUserId,
} from "#@/components";
import { useFavoriteCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId";
import { GameGridItem } from "#@/components/game/figure/GameGridItem";
import { useGames } from "#@/components/game/hooks/useGames";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { useOnMobilePlatform } from "#@/components/general/hooks/useOnMobilePlatform";
import { SimpleGrid } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useMemo } from "react";

interface Props {
  userId: string;
  limit?: number;
}

const ProfileFavoriteGames = ({ userId, limit = 10 }: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const onMobilePlatform = useOnMobilePlatform();
  // Favorites are hidden by the library ceiling (and each game's own level),
  // never by collection membership.
  const { isHidden, profile } = useIsLibraryHidden(userId);
  const ownUserId = useUserId();
  // Same rule as the library and collection listings: the entry level only
  // reaches the rendered items for the owner, never for another viewer.
  const isOwner = ownUserId != undefined && ownUserId === userId;
  const favoriteCollectionEntriesQuery = useFavoriteCollectionEntriesForUserId(
    userId,
    0,
    limit,
  );
  const gamesIds = favoriteCollectionEntriesQuery.data?.data.map(
    (entry) => entry.gameId,
  );
  const gamesQuery = useGames(
    {
      gameIds: gamesIds || [],
      relations: {
        cover: true,
      },
    },
    false,
    { ownerUserId: userId },
  );

  const games = useMemo(() => {
    if (gamesQuery.data == undefined) {
      return undefined;
    }

    if (!isOwner) {
      return gamesQuery.data;
    }

    const entries = favoriteCollectionEntriesQuery.data?.data;

    return gamesQuery.data.map((game) => {
      const relatedCollectionEntry = entries?.find(
        (entry) => entry.gameId === game.id,
      );

      return {
        ...game,
        // Owner-only badge: never expose another user's entry level.
        visibility: toLibraryVisibilityLevel(
          relatedCollectionEntry?.visibility,
        ),
      };
    });
  }, [favoriteCollectionEntriesQuery.data?.data, gamesQuery.data, isOwner]);

  const isLoading =
    favoriteCollectionEntriesQuery.isLoading || gamesQuery.isLoading;

  const isError = favoriteCollectionEntriesQuery.isError || gamesQuery.isError;

  const isEmpty =
    favoriteCollectionEntriesQuery.data == undefined ||
    favoriteCollectionEntriesQuery.data.data.length === 0 ||
    gamesQuery.data == undefined ||
    gamesQuery.data.length === 0;

  if (isHidden) {
    return <LibraryHiddenState profile={profile} />;
  }

  if (isLoading) {
    return <CenteredLoading />;
  } else if (isError) {
    return <CenteredErrorMessage message={t("profile.messages.fetchFailed")} />;
  } else if (isEmpty) {
    return (
      <CenteredErrorMessage message={t("profile.messages.noFavoriteGames")} />
    );
  }
  return (
    <DetailsBox
      title={t("profile.titles.favoriteGames")}
      withDimmedTitle
      stackProps={{
        className: onMobilePlatform ? "bg-paper-4 p-2" : undefined,
      }}
    >
      <SimpleGrid cols={onMobile ? 3 : 5} w={"100%"}>
        {games?.map((game) => {
          return <GameGridItem key={game.id} game={game} />;
        })}
      </SimpleGrid>
    </DetailsBox>
  );
};

export { ProfileFavoriteGames };
