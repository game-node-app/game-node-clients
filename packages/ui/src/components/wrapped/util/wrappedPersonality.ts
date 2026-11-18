import type { ProfileMetricsSummaryResponseDto } from "@repo/wrapper/server";

export const WRAPPED_PERSONALITY_IDS = [
  "adventurer",
  "sharpshooter",
  "strategist",
  "explorer",
  "acrobat",
  "thinker",
  "builder",
  "speedster",
  "athlete",
  "brawler",
  "completionist",
  "allrounder",
] as const;

export type WrappedPersonalityId = (typeof WRAPPED_PERSONALITY_IDS)[number];

/** A "completionist" finishes at least this share of what they played. */
const COMPLETIONIST_RATIO = 0.6;
/** ...but only once there is enough played to make that meaningful. */
const COMPLETIONIST_MIN_PLAYED = 3;

/** IGDB genre names, in the order they are tried. */
const GENRE_RULES: [RegExp, WrappedPersonalityId][] = [
  [/role-playing|\brpg\b/i, "adventurer"],
  [/shooter/i, "sharpshooter"],
  [/strateg|tactical|moba/i, "strategist"],
  [/adventure|point-and-click|visual novel/i, "explorer"],
  [/platform/i, "acrobat"],
  [/puzzle|quiz|trivia/i, "thinker"],
  [/simulat/i, "builder"],
  [/racing/i, "speedster"],
  [/sport/i, "athlete"],
  [/fighting|beat 'em up|hack and slash/i, "brawler"],
];

/** "Role-playing (RPG)" becomes "RPG"; names without parentheses are kept. */
export function getShortGenreName(name: string): string {
  const inParentheses = name.match(/\(([^)]+)\)/)?.[1];
  return (inParentheses ?? name).trim();
}

export interface WrappedPersonality {
  id: WrappedPersonalityId;
  /** Whole percent of the period spent in the top genre, when there is one. */
  genreSharePercent: number | null;
  /** Short name of the top genre ("RPG"), when there is one. */
  genre: string | null;
}

/**
 * The "gamer personality" shown on the Personality widget, from the period summary:
 * a high finish rate wins over everything, otherwise the top genre decides.
 */
export function getWrappedPersonality(
  summary: Pick<
    ProfileMetricsSummaryResponseDto,
    | "current"
    | "topGenre"
    | "playedInPeriod"
    | "finishedInPeriod"
  >,
): WrappedPersonality {
  const { topGenre, playedInPeriod, finishedInPeriod, current } = summary;
  const totalSeconds = current.totalPlaytimeSeconds;

  const genre = topGenre ? getShortGenreName(topGenre.name) : null;
  const genreSharePercent =
    topGenre && totalSeconds > 0
      ? Math.min(
          100,
          Math.round((topGenre.totalPlaytimeSeconds / totalSeconds) * 100),
        )
      : null;

  const isCompletionist =
    playedInPeriod >= COMPLETIONIST_MIN_PLAYED &&
    finishedInPeriod / playedInPeriod >= COMPLETIONIST_RATIO;
  const byGenre = topGenre
    ? GENRE_RULES.find(([rule]) => rule.test(topGenre.name))?.[1]
    : undefined;

  return {
    id: isCompletionist ? "completionist" : (byGenre ?? "allrounder"),
    genreSharePercent,
    genre,
  };
}
