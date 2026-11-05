import {
  ActionIcon,
  Box,
  Group,
  Image,
  Skeleton,
  Stack,
  Text,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useFavoriteCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId";
import { useGames } from "#@/components/game/hooks/useGames";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { Link } from "#@/util";

/** Same page as `ProfileFavoriteGames` (its default `limit`), so this lists what the profile shows. */
export const SETTINGS_PROFILE_FAVORITES_LIMIT = 10;

const COVER_CLASSNAME = "aspect-[264/354] w-full overflow-hidden rounded-md";

interface FavoriteItemProps {
  game: Game;
  position: number;
  disabled: boolean;
  onRemove: (gameId: number) => void;
}

function SettingsProfileFavoriteItem({
  game,
  position,
  disabled,
  onRemove,
}: FavoriteItemProps) {
  const { t } = useTranslation();
  const coverUrl = getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG);
  const removeLabel = t("settings.profile.favorites.remove", {
    game: game.name,
  });

  return (
    <Stack gap={6} className={"w-[90px] shrink-0"}>
      <Box className={`${COVER_CLASSNAME} bg-[#222]`}>
        <Image
          src={coverUrl ?? "/img/game_placeholder.jpeg"}
          alt={game.name}
          className={"h-full w-full object-cover"}
        />
      </Box>
      <Group gap={4} wrap={"nowrap"}>
        <Text
          fz={12}
          fw={500}
          lh={"normal"}
          className={"min-w-0 flex-1 text-[#adadad]"}
        >
          {position}
        </Text>
        <ActionIcon
          size={24}
          radius={6}
          variant={"default"}
          disabled={disabled}
          onClick={() => onRemove(game.id)}
          aria-label={removeLabel}
          title={removeLabel}
          className={"border-0 bg-[#222] text-[#d9d9d9] hover:bg-[#2a2a2a]"}
        >
          <IconX size={14} />
        </ActionIcon>
      </Group>
    </Stack>
  );
}

interface Props {
  userId: string;
  /** Favorites removed in the UI but not saved yet; hidden from the grid. */
  removedGameIds: number[];
  onRemove: (gameId: number) => void;
  disabled?: boolean;
}

/**
 * Favorite games grid. Removing only marks the game; it is unfavorited when the
 * tab's "Save changes" runs. There's no API to reorder or to add from here:
 * "Add" leads to the user's library, where games are opened and favorited.
 */
export function SettingsProfileFavorites({
  userId,
  removedGameIds,
  onRemove,
  disabled = false,
}: Props) {
  const { t } = useTranslation();
  const favoritesQuery = useFavoriteCollectionEntriesForUserId(
    userId,
    0,
    SETTINGS_PROFILE_FAVORITES_LIMIT,
  );
  const gameIds = favoritesQuery.data?.data.map((entry) => entry.gameId);
  // Same request as the profile page, so the order matches what it renders.
  // Keeps the previous covers while the list changes after a save.
  const gamesQuery = useGames(
    {
      gameIds,
      relations: { cover: true },
    },
    true,
  );

  const isLoading = favoritesQuery.isLoading || gamesQuery.isLoading;
  const isError = favoritesQuery.isError || gamesQuery.isError;

  const games = (gamesQuery.data ?? []).filter(
    (game) =>
      gameIds?.includes(game.id) === true && !removedGameIds.includes(game.id),
  );
  const totalItems = favoritesQuery.data?.pagination.totalItems ?? 0;
  const visibleTotal = Math.max(totalItems - removedGameIds.length, 0);

  const countLabel =
    visibleTotal === 1
      ? t("settings.profile.favorites.countOne")
      : t("settings.profile.favorites.countOther", { count: visibleTotal });

  const renderGrid = () => {
    if (isLoading) {
      return Array.from({ length: 5 }, (_, index) => (
        <Skeleton
          key={index}
          className={`${COVER_CLASSNAME} w-[90px] shrink-0`}
        />
      ));
    }

    return (
      <>
        {games.map((game, index) => (
          <SettingsProfileFavoriteItem
            key={game.id}
            game={game}
            position={index + 1}
            disabled={disabled}
            onRemove={onRemove}
          />
        ))}
        <Link
          href={`/library/${userId}`}
          className={
            "flex aspect-[264/354] w-[90px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-[#2a2a2a] text-[#adadad] no-underline transition-colors hover:border-[#7a7a7a] hover:text-white"
          }
        >
          <IconPlus size={18} />
          <Text component={"span"} fz={12} fw={500} c={"inherit"}>
            {t("settings.profile.favorites.add")}
          </Text>
        </Link>
      </>
    );
  };

  return (
    <SettingsSection
      title={t("settings.profile.favorites.title")}
      description={t("settings.profile.favorites.description")}
    >
      <SettingsCard>
        <Stack gap={16} className={"p-5"}>
          {!isLoading && !isError && (
            <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
              {visibleTotal === 0
                ? t("settings.profile.favorites.empty")
                : countLabel}
              {totalItems > SETTINGS_PROFILE_FAVORITES_LIMIT &&
                ` · ${t("settings.profile.favorites.showingFirst", {
                  count: SETTINGS_PROFILE_FAVORITES_LIMIT,
                })}`}
            </Text>
          )}
          {isError ? (
            <Text fz={13} lh={"18px"} className={"text-[#ff6369]"}>
              {t("profile.messages.fetchFailed")}
            </Text>
          ) : (
            <Box className={"flex flex-wrap gap-x-3 gap-y-4"}>
              {renderGrid()}
            </Box>
          )}
          <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
            {t("settings.profile.favorites.addHint")}
          </Text>
        </Stack>
      </SettingsCard>
    </SettingsSection>
  );
}
