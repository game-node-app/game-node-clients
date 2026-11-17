import { QueryClient, useQuery } from "@tanstack/react-query";
import { FollowService } from "../../../../../wrapper/src/server";

/**
 * Every query prefix that can change when the viewer follows or unfollows
 * `followedUserId`: following applies on the next read, so the followed user's
 * library, entries, journal, playtime, metrics and recap are now computed with
 * the viewer as a follower. The keys end with the viewer id, so a prefix that
 * stops at the followed user id matches every page/filter variant.
 */
export function getFollowedUserQueryKeyPrefixes(
  followedUserId: string,
): unknown[][] {
  return [
    ["userProfile", followedUserId],
    ["library", followedUserId],
    // `["collection-entries", "all" | "favorites", followedUserId, …]` is
    // covered here; entries of a collection are keyed by collection id, so the
    // domain prefix is the only way to reach the followed user's collections.
    ["collection"],
    ["collection-entries"],
    ["journal", "overview", followedUserId],
    ["journal", "heatmap", followedUserId],
    ["journal", "playlog", followedUserId],
    ["journal", "achievements", "obtained", followedUserId],
    ["playtime", "accumulated", "game", followedUserId],
    ["playtime", "game", followedUserId],
    ["playtime", "user", followedUserId],
    ["profile", "metrics", followedUserId],
    ["profile", "metrics", "distribution", followedUserId],
    ["profile", "metrics", "distribution", "type", followedUserId],
    ["profile", "metrics", "report", followedUserId],
    // Recap keys start with the year, so only the domain prefix can target them.
    ["recap"],
    ["activities"],
  ];
}

export function invalidateFollowedUserQueries(
  queryClient: QueryClient,
  followedUserId: string,
): Promise<void> {
  const prefixes = getFollowedUserQueryKeyPrefixes(followedUserId);

  // Inactive results (e.g. the empty listing read while the library was
  // hidden) are dropped, not just marked stale: web never refetches on mount,
  // so a stale entry would keep rendering the hidden-era data.
  prefixes.forEach((queryKey) =>
    queryClient.removeQueries({ queryKey, type: "inactive" }),
  );

  return Promise.all(
    prefixes.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  ).then(() => undefined);
}

/**
 * Returns a UserFollow entity using it's id.
 * @param id
 */
export function useUserFollow(id: number | undefined | null) {
  return useQuery({
    queryKey: ["follow", "entity", id],
    queryFn: async () => {
      return FollowService.followControllerGetUserFollowByIdV1(id!);
    },
    enabled: !!id,
  });
}
