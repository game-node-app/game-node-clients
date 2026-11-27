import { useEffect, useState, type CSSProperties } from "react";
import type { TFunction } from "i18next";
import { useMediaQuery, useReducedMotion } from "@mantine/hooks";
import type {
  ClaimGuildContractResponseDto,
  GuildRewardDescriptorDto,
} from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import styles from "../guild.module.css";
import expansionStyles from "./GuildContractsExpansion.module.css";
import { GuildChestResult } from "./GuildChestResult";
import { GUILD_CHAIN_TOTAL_STAGES } from "./guildContractExpansion";
import { GuildIcon } from "../scene/GuildIcon";
import { GuildRewardArt } from "../scene/GuildRewardArt";
import { LinaSprite } from "../scene/LinaSprite";
import { PixelButton } from "../scene/PixelButton";
import { formatGuildXp, getLinaLine, getRewardLabel } from "../util";

export interface GuildClaimCelebrationProps {
  opened: boolean;
  onClose(): void;
  /** Claim response (`POST /v1/guild/contracts/{id}/claim`). */
  result: ClaimGuildContractResponseDto | null;
}

const REWARD_KIND_KEYS: Record<string, string> = {
  badge: "guild.rewardsPanel.sections.badges",
  title: "guild.rewardsPanel.sections.titles",
  avatar_frame: "guild.rewardsPanel.sections.frames",
  weekly_chest: "guild.rewards.generic.chest",
  license_theme: "guild.rewardsPanel.sections.licenseThemes",
  stamp_style: "guild.rewardsPanel.sections.stampStyles",
  tavern_decor: "guild.rewardsPanel.sections.decor",
  consumable: "guild.rewardsPanel.sections.consumables",
  chest_bronze: "guild.claim.chest",
  chest_silver: "guild.claim.chest",
  chest_gold: "guild.claim.chest",
  chest_relic: "guild.claim.chest",
};

type Translate = (key: string, options?: Record<string, unknown>) => string;

function translate(
  t: TFunction,
  key: string,
  options?: Record<string, unknown>,
): string {
  return (t as unknown as Translate)(key, options);
}

/**
 * Newly granted rewards, chest cosmetic excluded because the chest block shows
 * it with its rarity, without duplicates.
 */
function collectRewards(
  result: ClaimGuildContractResponseDto,
): GuildRewardDescriptorDto[] {
  // The main chest and the Relic chests of a prestige each show their cosmetic.
  const chestKeys = new Set<string>();
  const mainKey = result.chestResult?.unlockedCosmetic?.key;
  if (mainKey) chestKeys.add(mainKey);
  for (const relic of result.prestigeRewards ?? []) {
    if (relic.unlockedCosmetic?.key) chestKeys.add(relic.unlockedCosmetic.key);
  }
  const seen = new Set<string>();

  return (result.unlockedRewards ?? []).filter((reward) => {
    if (chestKeys.has(reward.key) || seen.has(reward.key)) return false;
    seen.add(reward.key);
    return true;
  });
}

const COUNT_UP_MS = 800;
const COUNT_UP_TICK_MS = 16;
const MOBILE_QUERY = "(max-width: 47.99em)";

/**
 * `xpAwarded` counts up over 800 ms with an ease-out (design D5). The counter
 * mounts per claim so its first value is always zero; reduced motion renders
 * the final value immediately.
 */
function GuildClaimXpCounter({ xpAwarded }: { xpAwarded: number }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const reducedMotion = useReducedMotion();
  const [countedXp, setCountedXp] = useState(0);
  // `useReducedMotion` is false on the first render, so the final value has to
  // be picked at render time rather than as the initial state.
  const displayXp = reducedMotion ? xpAwarded : countedXp;

  useEffect(() => {
    if (reducedMotion || xpAwarded <= 0) return;

    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      const progress = Math.min(1, (Date.now() - startedAt) / COUNT_UP_MS);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCountedXp(Math.round(xpAwarded * eased));

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
 * with the stamp animation, and the expansion adds Seals, the bonus objective,
 * the chest receipt, Rank packages, Prestige Relic chests, the Passport stamp
 * and the Quest Chain progress, plus Lina's line from the claim response.
 */
export function GuildClaimCelebration({
  opened,
  onClose,
  result,
}: GuildClaimCelebrationProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const isMobile = useMediaQuery(MOBILE_QUERY, false);

  if (!result) return null;

  const rewards = collectRewards(result);
  const rankedUp = String(result.rankBefore) !== String(result.rankAfter);
  const chest = result.chestResult;
  // `globalXpAwarded` is account XP, separate from the Guild XP counter. The
  // line is hidden at 0 (small claims), per spec guild-hall.
  const accountXp = result.globalXpAwarded ?? 0;
  const sealsAwarded = result.sealsAwarded ?? 0;
  const promotionRewards = result.promotionRewards ?? [];
  const prestigeRewards = result.prestigeRewards ?? [];
  const passportCount = result.passportMonth?.completedContractsCount ?? 0;
  const chainProgress = result.chainProgress ?? null;
  const linaSegments = result.lina ? getLinaLine(result.lina, t) : [];
  const promotionPackageKey = `guild.rankPackages.${result.rankAfter}`;
  const promotionPackage = translate(t, promotionPackageKey);
  const stampsKey = "guild.passport.stamps";
  const stamps = translate(t, stampsKey, { count: passportCount });
  const passportStamps = stamps === stampsKey ? `${passportCount} / 6` : stamps;

  const kindLabel = (reward: GuildRewardDescriptorDto) =>
    translate(
      t,
      REWARD_KIND_KEYS[reward.kind as string] ?? "guild.rewards.generic.badge",
    );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      fullScreen={isMobile}
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

        {linaSegments.some((segment) => segment.text.length > 0) ? (
          <p className={expansionStyles.claimLinaLine} data-claim-lina>
            {linaSegments.map((segment, index) => (
              <span
                key={index}
                className={
                  segment.highlight
                    ? expansionStyles.claimLinaHighlight
                    : undefined
                }
              >
                {segment.text}
              </span>
            ))}
          </p>
        ) : null}

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

        {sealsAwarded > 0 ? (
          <span className={expansionStyles.claimSeals} data-claim-seals>
            <GuildIcon name="seal" size={22} />
            {t("guild.claim.seals", {
              seals: formatGuildXp(sealsAwarded, locale),
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

        {result.bonusCompleted ? (
          <span
            className={expansionStyles.claimBonus}
            data-claim-bonus-completed
          >
            <span className={expansionStyles.claimCheck} aria-hidden>
              ✓
            </span>
            {t("guild.claim.bonusCompleted")}
          </span>
        ) : null}

        {chest ? (
          <section
            className={expansionStyles.celebrationSection}
            data-claim-chest
          >
            <span
              className={cn(styles.pixelOverline, styles.claimSectionTitle)}
            >
              {t("guild.claim.chest")}
            </span>
            <GuildChestResult result={chest} />
          </section>
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
                    <GuildRewardArt
                      kind={reward.kind}
                      rewardKey={reward.key}
                      consumableKey={reward.consumableKey}
                      size={20}
                    />
                    {getRewardLabel(reward, t)}
                  </span>
                  <span
                    className={cn(styles.captionMedium, styles.claimRewardKind)}
                  >
                    {kindLabel(reward)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {promotionRewards.length > 0 ? (
          <section
            className={expansionStyles.celebrationSection}
            data-claim-promotion
          >
            <span
              className={cn(styles.pixelOverline, styles.claimSectionTitle)}
            >
              {t("guild.claim.promotion")}
            </span>
            {promotionPackage !== promotionPackageKey ? (
              <span className={expansionStyles.promotionPackage}>
                {promotionPackage}
              </span>
            ) : null}
            <ul className={styles.claimRewards}>
              {promotionRewards.map((reward) => (
                <li
                  key={reward.key}
                  className={styles.claimReward}
                  data-reward-key={reward.key}
                >
                  <span className={styles.claimRewardLabel}>
                    <GuildRewardArt
                      kind={reward.kind}
                      rewardKey={reward.key}
                      consumableKey={reward.consumableKey}
                      size={20}
                    />
                    {getRewardLabel(reward, t)}
                  </span>
                  <span
                    className={cn(styles.captionMedium, styles.claimRewardKind)}
                  >
                    {kindLabel(reward)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {prestigeRewards.length > 0 ? (
          <section
            className={expansionStyles.celebrationSection}
            data-claim-prestige
          >
            <span
              className={cn(styles.pixelOverline, styles.claimSectionTitle)}
            >
              {t("guild.claim.prestige")}
            </span>
            {prestigeRewards.map((relicChest, index) => (
              <GuildChestResult key={index} result={relicChest} />
            ))}
          </section>
        ) : null}

        {passportCount > 0 ? (
          <span className={expansionStyles.claimPassport} data-claim-passport>
            <GuildIcon name="stamp" size={18} />
            <span>{t("guild.claim.passportStamp")}</span>
            <span className={expansionStyles.claimPassportCount}>
              {passportStamps}
            </span>
          </span>
        ) : null}

        {chainProgress ? (
          <section
            className={expansionStyles.celebrationSection}
            data-claim-chain
            data-chain-completed={String(Boolean(chainProgress.chainCompleted))}
          >
            <span
              className={cn(styles.pixelOverline, styles.claimSectionTitle)}
            >
              {chainProgress.chainCompleted
                ? t("guild.claim.chainCompleted")
                : t("guild.claim.chainProgress")}
            </span>
            {chainProgress.chainCompleted ? (
              <>
                {(chainProgress.finalRewards ?? []).length > 0 ? (
                  <ul className={styles.claimRewards}>
                    {(chainProgress.finalRewards ?? []).map((reward) => (
                      <li
                        key={reward.key}
                        className={styles.claimReward}
                        data-chain-reward-key={reward.key}
                      >
                        <span className={styles.claimRewardLabel}>
                          <GuildRewardArt
                            kind={reward.kind}
                            rewardKey={reward.key}
                            consumableKey={reward.consumableKey}
                            size={20}
                          />
                          {getRewardLabel(reward, t)}
                        </span>
                        <span
                          className={cn(
                            styles.captionMedium,
                            styles.claimRewardKind,
                          )}
                        >
                          {kindLabel(reward)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {(chainProgress.bonusSealsAwarded ?? 0) > 0 ? (
                  <span className={expansionStyles.chainBonus}>
                    <GuildIcon name="seal" size={16} />
                    {t("guild.claim.chainBonus", {
                      seals: formatGuildXp(
                        chainProgress.bonusSealsAwarded,
                        locale,
                      ),
                    })}
                  </span>
                ) : null}
              </>
            ) : (
              <span className={expansionStyles.chainStage}>
                {t("guild.chains.stageOf", {
                  current: (chainProgress.currentStageIndex ?? 0) + 1,
                  total: GUILD_CHAIN_TOTAL_STAGES,
                })}
              </span>
            )}
          </section>
        ) : null}

        <div className={styles.claimActions}>
          <PixelButton onClick={onClose}>{t("guild.claim.close")}</PixelButton>
        </div>
      </div>
    </Modal>
  );
}
