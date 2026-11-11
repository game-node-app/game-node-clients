import { Box, Group, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { Game } from "@repo/wrapper/server";
import { GAME_COVER_PLACEHOLDER } from "#@/components/game/hooks/useGameCoverImage";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import {
  getSizedImageUrl,
  ImageSize,
} from "#@/components/game/util/getSizedImageUrl";
import { cn, Link } from "#@/util";

const ITEM_WIDTH = 110;
const COVER_WIDTH = 88;
const COVER_HEIGHT = 104;

const TrendingGameItem = ({ game }: { game: Game }) => {
  const coverUrl =
    getSizedImageUrl(getCoverUrl(game), ImageSize.COVER_BIG) ??
    GAME_COVER_PLACEHOLDER;

  return (
    <Link
      href={`/game/${game.id}`}
      className={"flex shrink-0 flex-col gap-2"}
      style={{ width: ITEM_WIDTH }}
    >
      <img
        src={coverUrl}
        alt={game.name}
        loading={"lazy"}
        decoding={"async"}
        className={"rounded object-cover"}
        style={{ width: COVER_WIDTH, height: COVER_HEIGHT }}
      />
      <Text fz={12} fw={700} c={"white"} lineClamp={1}>
        {game.name}
      </Text>
    </Link>
  );
};

const TrendingGameSkeleton = () => (
  <Box className={"flex shrink-0 flex-col gap-2"} style={{ width: ITEM_WIDTH }}>
    <Skeleton height={COVER_HEIGHT} width={COVER_WIDTH} radius={4} />
    <Skeleton height={16} width={"100%"} radius={4} />
  </Box>
);

export interface NotFoundTrendingGamesProps {
  games: Game[];
  isLoading: boolean;
  className?: string;
}

/**
 * "Trending now" strip shown under the 404 copy on small screens.
 * Hidden (and not rendered) when there is nothing to show.
 */
const NotFoundTrendingGames = ({
  games,
  isLoading,
  className,
}: NotFoundTrendingGamesProps) => {
  const { t } = useTranslation();

  if (!isLoading && games.length === 0) {
    return null;
  }

  return (
    <Box className={cn("w-full", className)}>
      <Text fz={18} lh={"28px"} fw={700} c={"white"} mb={12}>
        {t("notFoundPage.trending")}
      </Text>
      <Group
        gap={12}
        wrap={"nowrap"}
        align={"flex-start"}
        className={"overflow-x-auto"}
      >
        {isLoading
          ? Array(3)
              .fill(0)
              .map((_, index) => <TrendingGameSkeleton key={index} />)
          : games
              .slice(0, 3)
              .map((game) => <TrendingGameItem key={game.id} game={game} />)}
      </Group>
    </Box>
  );
};

export { NotFoundTrendingGames };
