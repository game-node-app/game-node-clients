import type { TFunction } from "i18next";
import type { GuildRewardDescriptorDto } from "@repo/wrapper/server";

type Translate = (key: string, options?: Record<string, unknown>) => string;

/**
 * Reward kinds map to the generic copy keys of design D7
 * (`guild.rewards.generic.{badge,title,frame,chest}`).
 */
const GENERIC_REWARD_KIND_KEYS: Record<string, string> = {
  badge: "badge",
  title: "title",
  avatar_frame: "frame",
  weekly_chest: "chest",
};

function translate(t: TFunction, key: string): string {
  return (t as unknown as Translate)(key);
}

/**
 * Localized reward label. Unknown reward keys fall back to the generic label of
 * their kind so a new server reward is never hidden (spec: guild-hall).
 */
export function getRewardLabel(
  reward: GuildRewardDescriptorDto | null | undefined,
  t: TFunction,
): string {
  if (!reward) return "";

  const key = `guild.rewards.${reward.key}`;
  const translated = translate(t, key);
  if (translated !== key) return translated;

  const genericKind = GENERIC_REWARD_KIND_KEYS[reward.kind] ?? "badge";
  const genericKey = `guild.rewards.generic.${genericKind}`;
  const generic = translate(t, genericKey);
  if (generic !== genericKey) return generic;

  return translate(t, "guild.rewards.generic.badge");
}
