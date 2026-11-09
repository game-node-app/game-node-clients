import { QueryClient } from "@tanstack/react-query";

/**
 * The collection entry listings append this element to their key only when the
 * custom cover filter is enabled (design Decision 6).
 */
function hasCustomCoverFilter(queryKey: readonly unknown[]): boolean {
  if (queryKey[0] !== "collection-entries") {
    return false;
  }

  const last = queryKey[queryKey.length - 1];
  return (
    last !== null &&
    typeof last === "object" &&
    (last as { hasCustomCover?: boolean }).hasCustomCover === true
  );
}

/**
 * A stored or removed choice changes the game's effective cover and the
 * owner's entries in filtered listings. Unpersonalized game keys and
 * unfiltered listings are not refetched.
 */
export function invalidateGameCoverQueries(
  queryClient: QueryClient,
  gameId: number,
) {
  void queryClient.invalidateQueries({ queryKey: ["game", gameId] });
  void queryClient.invalidateQueries({ queryKey: ["game", "all"] });
  void queryClient.invalidateQueries({ queryKey: ["game-cover", gameId] });
  void queryClient.invalidateQueries({
    predicate: (query) => hasCustomCoverFilter(query.queryKey),
  });
}
