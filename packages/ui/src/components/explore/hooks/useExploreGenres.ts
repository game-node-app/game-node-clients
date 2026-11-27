import { useMemo } from "react";
import { TRENDING_GENRE_IDS } from "#@/components/explore/util/trendingGenres";
import { useGamesResource } from "#@/components/game/hooks/useGamesResource";

/** The curated genres, in display order, that the server knows about. */
export function useExploreGenres() {
  const { data: resource } = useGamesResource("genres");
  return useMemo(
    () =>
      TRENDING_GENRE_IDS.flatMap((id) => {
        const name = resource?.find((item) => item.id === id)?.name;
        return name ? [{ id, name }] : [];
      }),
    [resource],
  );
}
