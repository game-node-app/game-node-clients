import { DetailsBox, useOnMobilePlatform } from "#@/components";
import { useFavoriteCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId";
import { GameGridItem } from "#@/components/game/figure/GameGridItem";
import { useGames } from "#@/components/game/hooks/useGames";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { SimpleGrid, Stack, Text } from "@mantine/core";
import { IconHeart } from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
  limit?: number;
}

const ProfileFavoriteGames = ({ userId, limit = 10 }: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const onMobilePlatform = useOnMobilePlatform();
  const isOwnProfile = useUserId() === userId;
  const favoriteCollectionEntriesQuery = useFavoriteCollectionEntriesForUserId(
    userId,
    0,
    limit,
  );
  const gamesIds = favoriteCollectionEntriesQuery.data?.data.map(
    (entry) => entry.gameId,
  );
  const gamesQuery = useGames({
    gameIds: gamesIds || [],
    relations: {
      cover: true,
    },
  });

  const isLoading =
    favoriteCollectionEntriesQuery.isLoading || gamesQuery.isLoading;

  const isError = favoriteCollectionEntriesQuery.isError || gamesQuery.isError;

  const isEmpty =
    favoriteCollectionEntriesQuery.data == undefined ||
    favoriteCollectionEntriesQuery.data.data.length === 0 ||
    gamesQuery.data == undefined ||
    gamesQuery.data.length === 0;

  if (isLoading) {
    return <CenteredLoading />;
  } else if (isError) {
    return <CenteredErrorMessage message={t("profile.messages.fetchFailed")} />;
  } else if (isEmpty) {
    // an empty list is not an error: neutral copy, and a hint on how to fill it on your own profile
    return (
      <Stack className={"gn-favorites-empty w-full items-center gap-1 py-6 text-center"}>
        <IconHeart size={28} className={"text-dimmed"} aria-hidden />
        <Text className={"font-semibold"}>
          {t("profile.messages.noFavoriteGamesTitle")}
        </Text>
        <Text className={"text-sm text-dimmed"}>
          {isOwnProfile
            ? t("profile.messages.noFavoriteGamesOwn")
            : t("profile.messages.noPublicFavoriteGames")}
        </Text>
      </Stack>
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
        {gamesQuery.data?.map((game) => {
          return <GameGridItem key={game.id} game={game} />;
        })}
      </SimpleGrid>
    </DetailsBox>
  );
};

export { ProfileFavoriteGames };