/**
 * Client-owned title catalog (design D13). The server stores only the
 * `titleKey`; labels live in the locales under `supporter.titles.<key>`.
 */

export const SUPPORTER_TITLE_KEYS = [
  "supporter",
  "patron",
  "collector",
  "completionist",
  "explorer",
  "critic",
  "night_owl",
  "retro_fan",
  "speedrunner",
  "cozy_gamer",
] as const;

export type SupporterTitleKey = (typeof SUPPORTER_TITLE_KEYS)[number];

/** The server's `titleKey` pattern; a client catalog key must fit it. */
export const SUPPORTER_TITLE_KEY_PATTERN = /^[a-z0-9_-]{1,32}$/;

export function isSupporterTitleKey(
  value: unknown,
): value is SupporterTitleKey {
  return (
    typeof value === "string" &&
    (SUPPORTER_TITLE_KEYS as readonly string[]).includes(value)
  );
}

export function getSupporterTitleLabelKey(
  key: SupporterTitleKey,
): `supporter.titles.${SupporterTitleKey}` {
  return `supporter.titles.${key}`;
}
