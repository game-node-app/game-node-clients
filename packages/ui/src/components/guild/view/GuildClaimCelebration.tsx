import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "@mantine/hooks";
import type {
  ClaimGuildContractResponseDto,
  GuildRewardDescriptorDto,
} from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import styles from "../guild.module.css";
import { GuildIcon } from "../scene/GuildIcon";
import { LinaSprite } from "../scene/LinaSprite";
import { PixelButton } from "../scene/PixelButton";
import { formatGuildXp, getRewardLabel } from "../util";
import type { GuildAssetName } from "../scene/assets";

export interface GuildClaimCelebrationProps {
  opened: boolean;
  onClose(): void;
  /** Claim response (`POST /v1/guild/contracts/{id}/claim`). */
  result: ClaimGuildContractResponseDto | null;
}

const REWARD_ICONS: Record<string, GuildAssetName> = {
  badge: "trophy",
  title: "book",
  avatar_frame: "shield",
  weekly_chest: "chest",
};

const REWARD_KIND_KEYS: Record<string, string> = {
  badge: "guild.rewardsPanel.sections.badges",
  title: "guild.rewardsPanel.sections.titles",
  avatar_frame: "guild.rewardsPanel.sections.frames",
  weekly_chest: "guild.rewards.generic.chest",
};

/**
 * Bumped reward keys, chest cosmetic included, without duplicates.
 */
function collectRewards(
  result: ClaimGuildContractResponseDto,
): GuildRewardDescriptorDto[] {
  const chestCosmetic = result.chestResult?.unlockedCosmetic ?? null;
  const rewards = [...result.unlockedRewards];
  const seen = new Set(rewards.map((reward) => reward.key));

  if (chestCosmetic && !seen.has(chestCosmetic.key)) {
    rewards.push(chestCosmetic);
  }

  return rewards;
}

const COUNT_UP_MS = 800;
const COUNT_UP_TICK_MS = 16;

/**
 * `xpAwarded` counts up over 800 ms with an ease-out (design D5). The counter
 * mounts per claim so its first value is always zero; reduced motion renders
 * the final value immediately.
 */
function GuildClaimXpCounter({ xpAwarded }: { xpAwarded: number }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const reducedMotion = useReducedMotion();
  const [displayXp, setDisplayXp] = useState(() =>
    reducedMotion ? xpAwarded : 0,
  );

  useEffect(() => {
    if (reducedMotion || xpAwarded <= 0) return;

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayXp(Math.round(xpAwarded * eased));

      if (progress >= 1) {
        window.clearInterval(interval);
      }
    }, COUNT_UP_TICK_MS);

    return () => window.clearInterval(interval);
  }, [xpAwarded, reducedMotion]);

  return (
    <span className={cn(styles.stamp, styles.claimXp)}>
      <GuildIcon name="coin" size={24} />
      {t("guild.claim.xp", {
        xp: formatGuildXp(displayXp, locale),
      })}
    </span>
  );
}

/**
 * Turn-in celebration (design D5/D6): the XP counter counts up over 800 ms
 * (final value immediately under reduced motion), the rank change slams in
 * with the stamp animation, and each newly unlocked reward enters staggered.
 */
export function GuildClaimCelebration({
  opened,
  onClose,
  result,
}: GuildClaimCelebrationProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";

  if (!result) return null;

  const rewards = collectRewards(result);
  const rankedUp = String(result.rankBefore) !== String(result.rankAfter);
  const chest = result.chestResult;
  // `globalXpAwarded` is account XP, separate from the Guild XP counter. The
  // line is hidden at 0 (small claims), per spec guild-hall.
  const accountXp = result.globalXpAwarded ?? 0;
  const translate = t as unknown as (
    key: string,
    options?: Record<string, unknown>,
  ) => string;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      padding={0}
      size="520px"
      classNames={{ content: styles.claimModalContent }}
    >
      <div className={cn(styles.root, styles.claimContent)}>
        <div className={styles.claimLina}>
          <LinaSprite pose="happy" isTalking={false} scale={5} />
        </div>

        <h2 className={cn(styles.pixelTitle, styles.claimTitle)}>
          {t("guild.claim.title")}
        </h2>

        <GuildClaimXpCounter
          key={`${result.contract.id}-${result.xpAwarded}`}
          xpAwarded={result.xpAwarded}
        />

        {accountXp > 0 ? (
          <span
            className={cn(styles.bodyMedium, "text-muted")}
            data-claim-account-xp
          >
            {t("guild.claim.accountXp", {
              xp: formatGuildXp(accountXp, locale),
            })}
          </span>
        ) : null}

        {rankedUp ? (
          <span
            className={cn(
              styles.stamp,
              styles.stampRank,
              styles.claimRank,
              styles.animStamp,
            )}
            data-rank={result.rankAfter}
          >
            {t("guild.claim.rankChange", {
              from: result.rankBefore,
              to: result.rankAfter,
            })}
          </span>
        ) : null}

        {rewards.length > 0 ? (
          <section className={styles.claimRewardsSection}>
            <span
              className={cn(styles.pixelOverline, styles.claimSectionTitle)}
            >
              {t("guild.claim.newRewards")}
            </span>
            <ul className={styles.claimRewards}>
              {rewards.map((reward, index) => (
                <li
                  key={reward.key}
                  className={cn(styles.claimReward, styles.animCardEnter)}
                  style={
                    {
                      "--guild-enter-delay": `${index * 60}ms`,
                    } as CSSProperties
                  }
                  data-reward-key={reward.key}
                >
                  <span className={styles.claimRewardLabel}>
                    <GuildIcon
                      name={REWARD_ICONS[reward.kind as string] ?? "star"}
                      size={20}
                    />
                    {getRewardLabel(reward, t)}
                  </span>
                  <span
                    className={cn(styles.captionMedium, styles.claimRewardKind)}
                  >
                    {translate(
                      REWARD_KIND_KEYS[reward.kind as string] ??
                        "guild.rewards.generic.badge",
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {chest ? (
          <span className={cn(styles.bodyMedium, styles.claimChest)}>
            <GuildIcon name="chest" size={20} />
            {t("guild.claim.chestBonus", {
              xp: formatGuildXp(chest.bonusXp, locale),
            })}
          </span>
        ) : null}

        <div className={styles.claimActions}>
          <PixelButton onClick={onClose}>{t("guild.claim.close")}</PixelButton>
        </div>
      </div>
    </Modal>
  );
}
