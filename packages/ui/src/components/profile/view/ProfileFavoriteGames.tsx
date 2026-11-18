import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useFavoriteCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useFavoriteCollectionEntriesForUserId";
import { toLibraryVisibilityLevel } from "#@/components/collection/collection-entry/visibility/LibraryVisibilityLevel";
import { GameFigureImage } from "#@/components/game/figure/GameFigureImage";
import { useGames } from "#@/components/game/hooks/useGames";
import { ImageSize } from "#@/components/game/util/getSizedImageUrl";
import { CenteredErrorMessage } from "#@/components/general/CenteredErrorMessage";
import { useSettingsModalState } from "#@/components/settings/hooks/useSettingsModalState";
import { cn, Link } from "#@/util";
import {
  Box,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconPlus } from "@tabler/icons-react";

const GRID =
  "grid grid-flow-col auto-cols-[39%] gap-2 overflow-x-auto pb-1 motion-safe:scroll-smooth snap-x sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-5 sm:overflow-visible";
const SLOT = "aspect-[224/264] snap-start rounded-md";

const ProfileFavoriteGames = ({
  userId,
  limit = 10,
}: {
  userId: string;
  limit?: number;
}) => {
  const { t } = useTranslation();
  const settings = useSettingsModalState();
  const isOwner = useUserId() === userId;
  const favorites = useFavoriteCollectionEntriesForUserId(userId, 0, limit);
  const entries = favorites.data?.data;
  const games = useGames(
    {
      gameIds: entries?.map((entry) => entry.gameId),
      relations: { cover: true },
    },
    false,
    { ownerUserId: userId },
  );
  const isLoading = favorites.isLoading || games.isLoading;
  const isError = favorites.isError || games.isError;
  const gamesById = new Map(games.data?.map((game) => [game.id, game]));
  const visibleEntries = (entries ?? []).filter((entry) =>
    gamesById.has(entry.gameId),
  );
  const count = visibleEntries.length;
  const isVisitorEmpty = !isOwner && !isLoading && !isError && count === 0;
  const emptySlots = isOwner
    ? Math.max(0, limit - count)
    : isVisitorEmpty
      ? limit
      : 0;

  return (
    <Stack component="section" gap="sm">
      <Group justify="space-between" gap="xs">
        <Group gap="xs" align="baseline">
          <Title order={2} size="h4">
            {t("profile.overview.favorites")}
          </Title>
          {!isLoading && !isError && !isVisitorEmpty && (
            <Text size="sm" c="dimmed">
              {isOwner && count < limit
                ? t("profile.overview.favoriteSlots", { count, limit })
                : t("profile.overview.favoriteCount", { count })}
            </Text>
          )}
        </Group>
        {isOwner && (
          <UnstyledButton
            className="text-sm text-[var(--profile-accent-text,var(--mantine-color-brand-filled))] hover:underline"
            onClick={() => settings.open("profile", "favorites")}
          >
            {t("profile.overview.editFavorites")}
          </UnstyledButton>
        )}
      </Group>
      {isError ? (
        <CenteredErrorMessage message={t("profile.messages.fetchFailed")} />
      ) : (
        <Box className="relative min-w-0">
          <Box className={GRID}>
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className={SLOT} />
              ))
            ) : (
              <>
                {visibleEntries.map((entry) => {
                  const game = gamesById.get(entry.gameId)!;
                  return (
                    <Box
                      key={entry.gameId}
                      className="group min-w-0 snap-start motion-safe:transition-transform motion-safe:hover:-translate-y-1"
                    >
                      <GameFigureImage
                        game={game}
                        imageSize={ImageSize.COVER_BIG_2X}
                        ratio={224 / 264}
                        linkProps={{
                          "aria-label": game.name,
                          className: "block w-full",
                        }}
                        visibility={
                          isOwner
                            ? toLibraryVisibilityLevel(entry.visibility)
                            : undefined
                        }
                        imageProps={{
                          radius: "md",
                          className:
                            "h-full w-full object-cover ring-inset group-hover:ring-1 group-hover:ring-[var(--profile-accent,var(--mantine-color-brand-filled))]",
                        }}
                      />
                    </Box>
                  );
                })}
                {Array.from({ length: emptySlots }, (_, index) =>
                  isOwner ? (
                    <Link
                      key={index}
                      href={`/library/${userId}`}
                      className={cn(
                        SLOT,
                        "flex flex-col items-center justify-center gap-2 border border-dashed border-line px-2 text-center text-xs text-dimmed transition-colors hover:border-line-strong hover:text-white",
                      )}
                    >
                      <IconPlus size={18} aria-hidden />
                      {t("settings.profile.favorites.add")}
                    </Link>
                  ) : (
                    <Box
                      key={index}
                      aria-hidden
                      className={cn(SLOT, "bg-paper-6")}
                    />
                  ),
                )}
              </>
            )}
          </Box>
          {isVisitorEmpty && (
            <Box className="pointer-events-none absolute inset-0 grid place-items-center p-3">
              <Paper
                radius="md"
                withBorder
                p="md"
                className="bg-body text-center"
              >
                <Text size="sm" fw={600}>
                  {t("profile.overview.noFavorites")}
                </Text>
                <Text size="sm" c="dimmed">
                  {t("profile.messages.noFavoriteGames")}
                </Text>
              </Paper>
            </Box>
          )}
        </Box>
      )}
    </Stack>
  );
};

export { ProfileFavoriteGames };
