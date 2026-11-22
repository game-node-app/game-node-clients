import type { QueryClient } from "@tanstack/react-query";

/**
 * Translator of the boot log. Keys live under `ruins.boot.line.*` /
 * `ruins.boot.status.*` and are checked against `en.json` by the boot tests;
 * the screen adapts the typed `t` from `@repo/locales` to this shape.
 */
export type BootTranslate = (
  key: string,
  options?: Record<string, string | number>,
) => string;

export const BOOT_VERSION = "3.0.27";

export type BootPanelKey =
  | "library"
  | "connections"
  | "importer"
  | "feats"
  | "daily"
  | "goal"
  | "awards";

export type BootLine = {
  id: string;
  /** Fake boot clock shown at the start of the line, e.g. `0.012`. */
  ts: string;
  label: string;
  /** `null` for the lines that end in the cursor (the active line). */
  status: string | null;
  pending: boolean;
  tone: "default" | "highlight";
  /** 0..1, drives the bars of the system-check panel. */
  ratio: number;
  panel?: BootPanelKey;
};

export type BootContext = {
  queryClient: QueryClient;
  userId: string | undefined;
  t: BootTranslate;
  online: boolean;
};

type Resolved = Pick<
  BootLine,
  "label" | "status" | "pending" | "tone" | "ratio"
>;

type BootLineDef = {
  id: string;
  ts: string;
  panel?: BootPanelKey;
  resolve: (ctx: BootContext) => Partial<Resolved> & { label: string };
};

const formatNumber = (value: number) => value.toLocaleString();

/** Reads one cached query. Never fetches. */
function read<T>(ctx: BootContext, key: readonly unknown[]): T | undefined {
  return ctx.queryClient.getQueryData<T>(key);
}

function readAll<T>(
  ctx: BootContext,
  key: readonly unknown[],
): Array<[readonly unknown[], T]> {
  return ctx.queryClient
    .getQueriesData<T>({ queryKey: key })
    .filter((entry): entry is [readonly unknown[], T] => entry[1] != null);
}

type LevelData = {
  currentLevel: number;
  currentLevelExp: number;
  levelUpExpCost: number;
};
type MetricsData = { totalGames: number; totalCollections: number };
type ConnectionData = { type: string; authStatus: string };
type ProfileData = { username?: string };
type ProgressData = { tier: number };
type GoalData = { year: number; target: number | null; finished: number };
type DailyData = { puzzles: unknown[] };
type AwardsData = { phase: string; year: number };
type ImporterData = { pagination?: { totalItems?: number } };
type NotificationsData = { unreadCount?: number; pages?: NotificationsData[] };

export function getCachedUsername(ctx: BootContext): string | undefined {
  if (!ctx.userId) return undefined;
  return read<ProfileData>(ctx, ["userProfile", ctx.userId, ctx.userId])
    ?.username;
}

export function getCachedLevel(ctx: BootContext): LevelData | undefined {
  if (!ctx.userId) return undefined;
  return read<LevelData>(ctx, ["user-level", ctx.userId]);
}

function getUnreadCount(ctx: BootContext): number | undefined {
  if (!ctx.userId) return undefined;
  for (const [key, data] of readAll<NotificationsData>(ctx, [
    "notifications",
    "aggregated",
  ])) {
    if (!key.includes(ctx.userId)) continue;
    const count = data.pages ? data.pages[0]?.unreadCount : data.unreadCount;
    if (typeof count === "number") return count;
  }
  return undefined;
}

const ok = (label: string): Partial<Resolved> & { label: string } => ({
  label,
  status: "OK",
  ratio: 1,
});

/**
 * The boot log, top to bottom (Figma `5638:836`). Every value comes from the
 * React Query cache at the moment the line lands: nothing is fetched and a
 * missing value renders as `PENDING`.
 *
 * Query keys read (see the hooks that own them):
 * - level: `["user-level", userId]`
 * - unit: `["userProfile", userId, userId]`
 * - library / collections: `["profile", "metrics", userId, userId]`
 * - connections: `["connections", "user", userId]`
 * - imports: prefix `["importer", "entries", "unprocessed"]`
 * - feats: `["achievements", "progress", userId]`
 * - yearly goal: prefix `["recap", "goals"]` (`[..., year, userId]`)
 * - daily: `["daily", "today", userId]`
 * - awards: `["awards", "event", "current"]`
 * - notifications: prefix `["notifications", "aggregated"]` (`unreadCount`)
 */
export const BOOT_LINE_DEFS: BootLineDef[] = [
  {
    id: "init",
    ts: "0.000",
    resolve: (ctx) => ({
      label: ctx.t("ruins.boot.line.init", { version: BOOT_VERSION }),
      status: "",
      ratio: 1,
    }),
  },
  {
    id: "memory",
    ts: "0.012",
    resolve: (ctx) => ok(ctx.t("ruins.boot.line.memory")),
  },
  {
    id: "core",
    ts: "0.031",
    resolve: (ctx) => ok(ctx.t("ruins.boot.line.core")),
  },
  {
    id: "theme",
    ts: "0.048",
    resolve: (ctx) => ok(ctx.t("ruins.boot.line.theme")),
  },
  {
    id: "tokens",
    ts: "0.063",
    resolve: (ctx) => ({
      label: ctx.t("ruins.boot.line.tokens"),
      status: "11/11",
      ratio: 1,
    }),
  },
  {
    id: "unit",
    ts: "0.077",
    resolve: (ctx) => {
      const name = getCachedUsername(ctx);
      return name
        ? ok(ctx.t("ruins.boot.line.unitDetail", { name }))
        : { label: ctx.t("ruins.boot.line.unit"), pending: true };
    },
  },
  {
    id: "level",
    ts: "0.103",
    resolve: (ctx) => {
      const level = getCachedLevel(ctx);
      if (!level)
        return { label: ctx.t("ruins.boot.line.level"), pending: true };
      return {
        label: ctx.t("ruins.boot.line.levelDetail", {
          level: level.currentLevel,
          xp: formatNumber(level.currentLevelExp),
        }),
        status: "SYNC",
        ratio:
          level.levelUpExpCost > 0
            ? Math.min(1, level.currentLevelExp / level.levelUpExpCost)
            : 1,
      };
    },
  },
  {
    id: "library",
    ts: "0.140",
    panel: "library",
    resolve: (ctx) => {
      const metrics = ctx.userId
        ? read<MetricsData>(ctx, ["profile", "metrics", ctx.userId, ctx.userId])
        : undefined;
      return metrics
        ? ok(
            ctx.t("ruins.boot.line.libraryDetail", {
              games: formatNumber(metrics.totalGames),
            }),
          )
        : { label: ctx.t("ruins.boot.line.library"), pending: true };
    },
  },
  {
    id: "collections",
    ts: "0.152",
    resolve: (ctx) => {
      const metrics = ctx.userId
        ? read<MetricsData>(ctx, ["profile", "metrics", ctx.userId, ctx.userId])
        : undefined;
      return metrics
        ? ok(
            ctx.t("ruins.boot.line.collectionsDetail", {
              total: formatNumber(metrics.totalCollections),
            }),
          )
        : { label: ctx.t("ruins.boot.line.collections"), pending: true };
    },
  },
  {
    id: "connections",
    ts: "0.188",
    panel: "connections",
    resolve: (ctx) => {
      const connections = ctx.userId
        ? read<ConnectionData[]>(ctx, ["connections", "user", ctx.userId])
        : undefined;
      const types = connections
        ? connections.map((c) => String(c.type).toUpperCase()).join("·")
        : "";
      const label = types
        ? `${ctx.t("ruins.boot.line.connections")} ${types}`
        : ctx.t("ruins.boot.line.connections");

      if (!ctx.online) {
        return {
          label,
          status: ctx.t("ruins.boot.offline"),
          tone: "highlight",
          ratio: 0,
        };
      }
      if (!connections) return { label, pending: true };

      const connected = connections.filter(
        (c) => c.authStatus === "connected",
      ).length;
      return {
        label,
        status: `${connected}/${connections.length}`,
        ratio: connections.length ? connected / connections.length : 1,
      };
    },
  },
  {
    id: "importer",
    ts: "0.231",
    panel: "importer",
    resolve: (ctx) => {
      const entries = readAll<ImporterData>(ctx, [
        "importer",
        "entries",
        "unprocessed",
      ]);
      const label = ctx.t("ruins.boot.line.importer");
      if (entries.length === 0) return { label, pending: true };
      const total = entries.reduce(
        (sum, [, data]) => sum + (data.pagination?.totalItems ?? 0),
        0,
      );
      return {
        label,
        status: total > 0 ? `+${formatNumber(total)}` : "0",
        ratio: 1,
      };
    },
  },
  {
    id: "feats",
    ts: "0.302",
    panel: "feats",
    resolve: (ctx) => {
      const progress = ctx.userId
        ? read<ProgressData[]>(ctx, ["achievements", "progress", ctx.userId])
        : undefined;
      const label = ctx.t("ruins.boot.line.feats");
      return progress
        ? {
            label,
            status: formatNumber(progress.filter((p) => p.tier > 0).length),
            ratio: 1,
          }
        : { label, pending: true };
    },
  },
  {
    id: "goal",
    ts: "0.355",
    panel: "goal",
    resolve: (ctx) => {
      const goals = ctx.userId
        ? readAll<GoalData>(ctx, ["recap", "goals"])
            .filter(([key]) => key[3] === ctx.userId)
            .map(([, goal]) => goal)
            .filter((goal) => goal.target != null && goal.target > 0)
            .sort((a, b) => b.year - a.year)
        : [];
      const goal = goals[0];
      if (!goal) return { label: ctx.t("ruins.boot.line.goal"), pending: true };
      const ratio = Math.min(1, goal.finished / goal.target!);
      return {
        label: ctx.t("ruins.boot.line.goalDetail", {
          year: goal.year,
          finished: goal.finished,
          target: goal.target ?? 0,
        }),
        status: `${Math.round(ratio * 100)}%`,
        ratio,
      };
    },
  },
  {
    id: "daily",
    ts: "0.391",
    panel: "daily",
    resolve: (ctx) => {
      const daily = read<DailyData>(ctx, ["daily", "today", ctx.userId]);
      const label = ctx.t("ruins.boot.line.daily");
      return daily?.puzzles
        ? {
            label,
            status: ctx.t("ruins.boot.status.modes", {
              n: daily.puzzles.length,
            }),
            ratio: 1,
          }
        : { label, pending: true };
    },
  },
  {
    id: "awards",
    ts: "0.430",
    panel: "awards",
    resolve: (ctx) => {
      const event = read<AwardsData | null>(ctx, [
        "awards",
        "event",
        "current",
      ]);
      const label = ctx.t("ruins.boot.line.awards");
      if (!event) return { label, pending: true };
      const detail = ctx.t("ruins.boot.line.awardsDetail", {
        year: event.year,
      });
      switch (event.phase) {
        case "nominations":
        case "voting":
          return {
            label: detail,
            status: ctx.t("ruins.boot.status.open"),
            tone: "highlight",
            ratio: 1,
          };
        case "results":
          return {
            label: detail,
            status: ctx.t("ruins.boot.status.results"),
            ratio: 1,
          };
        case "upcoming":
          return {
            label: detail,
            status: ctx.t("ruins.boot.status.soon"),
            ratio: 0.5,
          };
        default:
          return {
            label: detail,
            status: ctx.t("ruins.boot.status.closed"),
            ratio: 1,
          };
      }
    },
  },
  {
    id: "notifications",
    ts: "0.468",
    resolve: (ctx) => {
      const unread = getUnreadCount(ctx);
      const label = ctx.t("ruins.boot.line.notifications");
      return unread == null
        ? { label, pending: true }
        : {
            label,
            status: formatNumber(unread),
            tone: unread > 0 ? "highlight" : "default",
            ratio: 1,
          };
    },
  },
  {
    id: "menu",
    ts: "0.547",
    resolve: (ctx) => ({
      label: ctx.t("ruins.boot.line.menu"),
      status: null,
      ratio: 1,
    }),
  },
];

export const BOOT_LAST_TS = BOOT_LINE_DEFS[BOOT_LINE_DEFS.length - 1].ts;

export function resolveBootLine(def: BootLineDef, ctx: BootContext): BootLine {
  const resolved = def.resolve(ctx);
  const pending = resolved.pending === true;
  return {
    id: def.id,
    ts: def.ts,
    panel: def.panel,
    label: resolved.label,
    pending,
    status:
      pending || resolved.status === undefined
        ? ctx.t("ruins.boot.pending")
        : resolved.status,
    tone: resolved.tone ?? "default",
    ratio: pending ? 0 : (resolved.ratio ?? 1),
  };
}
