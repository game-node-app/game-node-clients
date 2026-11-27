import type { TFunction } from "i18next";
import type { GuildRewardDescriptorDto } from "@repo/wrapper/server";

type Translate = (key: string, options?: Record<string, unknown>) => string;

/**
 * Every reward kind of hand-off 8.7 maps to a generic copy key of design D3
 * (`guild.rewards.generic.*`). All four chest tiers share the chest fallback;
 * the legacy `weekly_chest` is one of them.
 */
const GENERIC_REWARD_KIND_KEYS: Record<string, string> = {
  badge: "badge",
  title: "title",
  avatar_frame: "frame",
  license_theme: "license_theme",
  stamp_style: "stamp_style",
  tavern_decor: "tavern_decor",
  consumable: "consumable",
  weekly_chest: "chest",
  chest_bronze: "chest",
  chest_silver: "chest",
  chest_gold: "chest",
  chest_relic: "chest",
};

/** Unknown kinds keep the oldest generic label so a new kind is never hidden. */
const FALLBACK_REWARD_KIND_KEY = "badge";

function translate(t: TFunction, key: string): string {
  return (t as unknown as Translate)(key);
}

/**
 * Localized reward label. Unknown reward keys fall back to the generic label of
 * their kind (all 12 kinds of hand-off 8.7), and unknown kinds to the generic
 * badge label, so a new server reward is never hidden (spec: guild-hall).
 */
export function getRewardLabel(
  reward: GuildRewardDescriptorDto | null | undefined,
  t: TFunction,
): string {
  if (!reward) return "";

  const key = `guild.rewards.${reward.key}`;
  const translated = translate(t, key);
  if (translated !== key) return translated;

  const genericKind =
    GENERIC_REWARD_KIND_KEYS[reward.kind] ?? FALLBACK_REWARD_KIND_KEY;
  const genericKey = `guild.rewards.generic.${genericKind}`;
  const generic = translate(t, genericKey);
  if (generic !== genericKey) return generic;

  return translate(t, `guild.rewards.generic.${FALLBACK_REWARD_KIND_KEY}`);
}
