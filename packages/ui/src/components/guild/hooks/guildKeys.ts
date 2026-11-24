import type { QueryClient } from "@tanstack/react-query";

/** All Guild queries start with this prefix. */
export const GUILD_QUERY_ROOT = "guild";

/** Design D1: Guild reads are fresh for 30 s and always refetch on mount. */
export const GUILD_QUERY_STALE_TIME = 30_000;

/** Design D1: the public access read is fresh for 60 s. */
export const GUILD_ACCESS_STALE_TIME = 60_000;

/** Re-read access when the Guild screen regains focus after a long pause. */
export const GUILD_ACCESS_FOCUS_REFRESH_MS = 5 * 60_000;

export const GUILD_CONTRACTS_PAGE_SIZE = 20;

export type GuildContractsTab = "accepted" | "completed";

function guildKey(...parts: unknown[]): unknown[] {
  return [GUILD_QUERY_ROOT, ...parts];
}

/**
 * Query-key builder shared by every Guild hook (and the wave-2 views), so
 * invalidation never depends on an ad-hoc array.
 */
export const guildKeys = {
  all: (): unknown[] => guildKey(),

  access: (userId?: string | null): unknown[] =>
    guildKey("access", userId ?? null),
  accessRoot: (): unknown[] => guildKey("access"),

  overview: (userId?: string | null): unknown[] =>
    guildKey("overview", userId ?? null),
  overviewRoot: (): unknown[] => guildKey("overview"),

  board: (userId: string | null | undefined, quick: boolean): unknown[] =>
    guildKey("board", userId ?? null, { quick }),
  boardRoot: (): unknown[] => guildKey("board"),

  contracts: (
    userId: string | null | undefined,
    tab: GuildContractsTab,
  ): unknown[] => guildKey("contracts", userId ?? null, tab),
  contractsRoot: (): unknown[] => guildKey("contracts"),

  rewards: (userId?: string | null): unknown[] =>
    guildKey("rewards", userId ?? null),
  rewardsRoot: (): unknown[] => guildKey("rewards"),
};

/**
 * Refreshes every player-facing Guild read after a mutation (design D1). The
 * access query is intentionally left alone: only the 403 mapping re-reads it.
 */
export function invalidateGuild(queryClient: QueryClient): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: guildKeys.overviewRoot() }),
    queryClient.invalidateQueries({ queryKey: guildKeys.boardRoot() }),
    queryClient.invalidateQueries({ queryKey: guildKeys.contractsRoot() }),
    queryClient.invalidateQueries({ queryKey: guildKeys.rewardsRoot() }),
  ]).then(() => undefined);
}
