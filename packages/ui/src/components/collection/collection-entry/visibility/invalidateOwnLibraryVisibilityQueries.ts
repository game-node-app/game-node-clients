import type { QueryClient } from "@tanstack/react-query";

/**
 * Query key domains that hold data filtered by library visibility.
 *
 * Invalidation is by the first key segment on purpose: the hooks append the
 * viewer id (and sometimes the owner id) after it, so the broad prefix keeps
 * working when the key shape changes.
 */
const LIBRARY_VISIBILITY_QUERY_PREFIXES: readonly unknown[][] = [
  ["userProfile"],
  ["library"],
  ["favorites"],
  ["collection"],
  ["collections"],
  ["collection-entries"],
];

/**
 * Invalidates every cached read whose result depends on the owner's library
 * visibility: profile, library, favorites, collections and collection entries.
 *
 * Call it after changing a game's visibility or the profile's
 * `libraryVisibility`, so the owner's views and any cached visitor view are
 * refetched.
 */
export function invalidateOwnLibraryVisibilityQueries(
  queryClient: QueryClient,
  userId?: string | null,
): Promise<void> {
  const queryKeys: unknown[][] = LIBRARY_VISIBILITY_QUERY_PREFIXES.map(
    (queryKey) => [...queryKey],
  );

  if (userId) {
    // Owner-scoped key variants, in case a narrower key is cached.
    queryKeys.push(
      ["userProfile", userId],
      ["library", userId],
      ["collections", userId],
    );
  }

  return Promise.all(
    queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  ).then(() => undefined);
}
