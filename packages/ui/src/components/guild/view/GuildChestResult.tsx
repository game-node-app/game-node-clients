import type { TFunction } from "i18next";
import type { GuildChestResultDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util";

import styles from "./GuildContractsExpansion.module.css";
import {
  getChestAsset,
  getConsumableAsset,
  getRarityClass,
} from "../scene/cosmeticAssets";
import { GuildIcon } from "../scene/GuildIcon";
import { GuildRewardArt } from "../scene/GuildRewardArt";
import { formatGuildXp, getRewardLabel } from "../util";

type Translate = (key: string, options?: Record<string, unknown>) => string;

function translate(t: TFunction, key: string): string {
  return (t as unknown as Translate)(key);
}

/** `chests.<kind>` with the generic chest label for unknown server tiers. */
function getChestLabel(kind: string | null | undefined, t: TFunction): string {
  if (kind) {
    const key = `guild.chests.${kind}`;
    const translated = translate(t, key);
    if (translated !== key) return translated;
  }

  return translate(t, "guild.rewards.generic.chest");
}

function getConsumableLabel(
  key: string | null | undefined,
  t: TFunction,
): string {
  if (key) {
    const consumableKey = `guild.consumables.${key}.name`;
    const consumable = translate(t, consumableKey);
    if (consumable !== consumableKey) return consumable;

    const rewardKey = `guild.rewards.${key}`;
    const reward = translate(t, rewardKey);
    if (reward !== rewardKey) return reward;
  }

  return translate(t, "guild.rewards.generic.consumable");
}

function getRarityLabel(
  rarity: string | null | undefined,
  t: TFunction,
): string | null {
  if (!rarity) return null;

  const key = `guild.rarity.${rarity}`;
  const translated = translate(t, key);
  return translated === key ? null : translated;
}

/**
 * One chest receipt (design D6/8.6): the tier artwork and name, its bonus XP and
 * Seals, the unlocked cosmetic with its rarity (or the exhausted-pool
 * conversion when `unlockedCosmetic` is null) and any consumable drop.
 *
 * Self-contained so the claim celebration, the Emporium, the Passport and the
 * Bounties reuse the exact same block.
 */
export function GuildChestResult({
  result,
  compact = false,
}: {
  result: GuildChestResultDto;
  compact?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";

  const chestKind = result.chestKind as string | undefined;
  const bonusXp = result.bonusXp ?? 0;
  const bonusSeals = result.bonusSeals ?? 0;
  const cosmetic = result.unlockedCosmetic ?? null;
  const rarityLabel = getRarityLabel(cosmetic?.rarity, t);
  const consumable = result.grantedConsumable ?? null;
  const exhaustedCopy = t("guild.chests.poolExhausted");

  return (
    <div
      className={cn(styles.chest, compact && styles.chestCompact)}
      data-chest-kind={chestKind ?? "unknown"}
      data-chest-exhausted={cosmetic ? undefined : "true"}
    >
      <div className={styles.chestHeader}>
        <GuildIcon
          name={getChestAsset(chestKind)}
          size={compact ? 30 : 40}
          className={styles.chestArt}
        />
        <div className={styles.chestHeadings}>
          <span className={styles.chestTitle}>
            {getChestLabel(chestKind, t)}
          </span>
          <span className={styles.chestBonuses}>
            {bonusXp > 0 ? (
              <span className={styles.chestBonus} data-chest-xp>
                <GuildIcon name="coin" size={14} />
                {t("guild.claim.chestBonus", {
                  xp: formatGuildXp(bonusXp, locale),
                })}
              </span>
            ) : null}
            {bonusSeals > 0 ? (
              <span className={styles.chestBonus} data-chest-seals>
                <GuildIcon name="seal" size={14} />
                {t("guild.seals.reward", {
                  seals: formatGuildXp(bonusSeals, locale),
                })}
              </span>
            ) : null}
          </span>
        </div>
      </div>

      {cosmetic ? (
        <div
          className={cn(styles.chestCosmetic, getRarityClass(cosmetic.rarity))}
          data-reward-key={cosmetic.key}
        >
          <span className={styles.chestCosmeticLabel}>
            <GuildRewardArt
              kind={cosmetic.kind}
              rewardKey={cosmetic.key}
              consumableKey={cosmetic.consumableKey}
              size={16}
            />
            {getRewardLabel(cosmetic, t)}
          </span>
          {rarityLabel ? (
            <span className={styles.chestRarity}>{rarityLabel}</span>
          ) : null}
        </div>
      ) : (
        <p className={styles.chestExhausted} data-chest-conversion>
          {exhaustedCopy}
        </p>
      )}

      {consumable ? (
        <div
          className={styles.chestConsumable}
          data-consumable-key={consumable}
        >
          <GuildIcon name={getConsumableAsset(consumable)} size={16} />
          <span>{t("guild.claim.consumableDrop")}</span>
          <span className={styles.chestConsumableName}>
            {getConsumableLabel(consumable, t)}
          </span>
        </div>
      ) : null}
    </div>
  );
}
