import { useElementSize, useMediaQuery } from "@mantine/hooks";
import type { CSSProperties } from "react";
import {
  GuildRewardDescriptorDto,
  type GuildContractDto,
  type LinaReceptionDto,
} from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";

import styles from "../guild.module.css";
import expansionStyles from "./GuildBoardExpansion.module.css";
import { GuildIcon } from "../scene/GuildIcon";
import { LinaDialogue } from "../scene/LinaDialogue";
import { LinaSprite } from "../scene/LinaSprite";
import { PixelButton } from "../scene/PixelButton";
import {
  formatGuildXp,
  getLinaLine,
  getQuestCopy,
  getRewardLabel,
} from "../util";

export interface GuildAcceptedStateProps {
  opened: boolean;
  onClose(): void;
  /** `POST /v1/guild/contracts` contract (status `active`). */
  contract: GuildContractDto;
  /** Acceptance reception (`contract_accepted`); drives Lina's line. */
  lina: LinaReceptionDto | null;
  onViewContracts(): void;
}

const SCENE_WIDTH = 640;
const SCENE_HEIGHT = 330;
const MOBILE_QUERY = "(max-width: 47.99em)";

const PLANKS = [60, 228, 396, 564];
const COUNTER_JOINTS = [50, 130, 210, 290, 370, 450, 530];
const SPARKLES = [
  { left: 44, top: 70, size: 32 },
  { left: 236, top: 52, size: 28 },
  { left: 258, top: 140, size: 24 },
  { left: 30, top: 170, size: 24 },
] as const;

/**
 * Frame 9:387. The Guild `Modal` (an `ion-modal` on mobile) portals outside the
 * hall, so every pixel-art variable lives on its own `styles.root`.
 */
export function GuildAcceptedState({
  opened,
  onClose,
  contract,
  lina,
  onViewContracts,
}: GuildAcceptedStateProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const isMobile = useMediaQuery(MOBILE_QUERY, false);
  const { ref: sceneRef, width } = useElementSize<HTMLDivElement>();
  const userId = useUserId();
  const profile = useUserProfile(userId, { enabled: opened });

  const copy = getQuestCopy(contract, t, locale);
  const targetName = contract.targetGame?.name ?? null;
  const equippedTitleKey = profile.data?.guildTitleKey ?? null;
  const adventurerName = equippedTitleKey
    ? getRewardLabel(
        {
          id: equippedTitleKey,
          key: equippedTitleKey,
          kind: GuildRewardDescriptorDto.kind.TITLE,
          achievementId: null,
          inChestPool: false,
          chestBonusXp: 0,
          chestBonusSeals: 0,
          rarity: GuildRewardDescriptorDto.rarity.COMMON,
          consumableKey: null,
        },
        t,
      )
    : (profile.data?.username ?? "");

  // Scale the fixed 640x330 composition down on narrow screens; jsdom has no
  // layout, so a missing measurement keeps the desktop scale.
  const scale = width > 0 ? Math.min(1, width / SCENE_WIDTH) : 1;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      centered
      fullScreen={isMobile}
      padding={0}
      size="640px"
      classNames={{ content: styles.acceptedModalContent }}
    >
      <div className={styles.root}>
        <div className={styles.acceptedShell} data-gn-artwork="">
          <div
            ref={sceneRef}
            className={styles.acceptedViewport}
            style={{ height: Math.round(SCENE_HEIGHT * scale) }}
          >
            <div
              className={styles.acceptedStage}
              style={{
                transform: `translateX(-50%) scale(${scale})`,
              }}
            >
              {PLANKS.map((left) => (
                <span
                  key={left}
                  className={styles.acceptedPlank}
                  style={{ left }}
                  aria-hidden
                />
              ))}
              <span className={styles.acceptedBeam} aria-hidden />
              <span className={styles.acceptedRail} aria-hidden />
              <span className={styles.acceptedWainscot} aria-hidden />

              <GuildIcon name="accepted-glow" className={styles.acceptedGlow} />

              <div className={styles.acceptedLina}>
                <LinaSprite pose="happy" isTalking={false} scale={6} hop />
              </div>

              {SPARKLES.map((sparkle, index) => (
                <span
                  key={`${sparkle.left}-${sparkle.top}`}
                  className={styles.acceptedSparkle}
                  style={
                    {
                      left: sparkle.left,
                      top: sparkle.top,
                      "--guild-sparkle-delay": `${550 + index * 120}ms`,
                    } as CSSProperties
                  }
                >
                  <GuildIcon
                    name="star"
                    size={sparkle.size}
                    className={styles.animSparkle}
                  />
                </span>
              ))}

              <div className={styles.acceptedCounter} aria-hidden>
                <span className={styles.acceptedCounterTop} />
                <span className={styles.acceptedCounterOutline} />
                <span className={styles.acceptedCounterFront} />
                <span className={styles.acceptedCounterEdge} />
                {COUNTER_JOINTS.map((left) => (
                  <span
                    key={left}
                    className={styles.acceptedCounterJoint}
                    style={{ left }}
                  />
                ))}
              </div>

              <article
                className={cn(styles.acceptedContract, styles.animShake)}
                data-contract-id={contract.id}
              >
                <span
                  className={cn(
                    styles.pixelOverline,
                    styles.acceptedContractOverline,
                  )}
                >
                  {t("guild.accepted.overline")}
                </span>
                <h2
                  className={cn(
                    styles.pixelTitle,
                    styles.acceptedContractTitle,
                  )}
                >
                  {copy.title}
                </h2>
                <dl className={styles.acceptedRows}>
                  <div className={styles.acceptedRow}>
                    <dt
                      className={cn(
                        styles.captionText,
                        styles.acceptedRowLabel,
                      )}
                    >
                      {t("guild.accepted.adventurer")}
                    </dt>
                    <dd
                      className={cn(styles.bodyMedium, styles.acceptedRowValue)}
                    >
                      {adventurerName}
                    </dd>
                  </div>
                  {targetName ? (
                    <div className={styles.acceptedRow}>
                      <dt
                        className={cn(
                          styles.captionText,
                          styles.acceptedRowLabel,
                        )}
                      >
                        {t("guild.accepted.target")}
                      </dt>
                      <dd
                        className={cn(
                          styles.bodyMedium,
                          styles.acceptedRowValue,
                        )}
                      >
                        {targetName}
                      </dd>
                    </div>
                  ) : null}
                  <div className={styles.acceptedRow}>
                    <dt
                      className={cn(
                        styles.captionText,
                        styles.acceptedRowLabel,
                      )}
                    >
                      {t("guild.accepted.rank")}
                    </dt>
                    <dd
                      className={cn(styles.bodyMedium, styles.acceptedRowValue)}
                    >
                      {t("guild.accepted.rankXp", {
                        rank: contract.rank,
                        xp: formatGuildXp(contract.xpReward, locale),
                      })}
                    </dd>
                  </div>
                </dl>
                <div className={styles.acceptedSignature}>
                  {t("guild.accepted.signature")}
                </div>
              </article>

              <span
                className={cn(
                  styles.acceptedStamp,
                  styles.stampAccepted,
                  styles.animStamp,
                )}
              >
                {t("guild.accepted.stamp")}
              </span>

              <span
                className={cn(
                  styles.acceptedXpChip,
                  expansionStyles.acceptedChips,
                  styles.pixelLabel,
                  styles.animXpChip,
                )}
              >
                <span className={expansionStyles.acceptedChipGroup}>
                  <GuildIcon name="coin" size={20} />
                  {t("guild.accepted.xpChip", {
                    xp: formatGuildXp(contract.xpReward, locale),
                  })}
                </span>
                {contract.sealsReward > 0 ? (
                  <span
                    className={cn(
                      expansionStyles.acceptedChipGroup,
                      expansionStyles.acceptedSeals,
                    )}
                  >
                    <GuildIcon name="seal" size={18} />
                    {t("guild.seals.reward", {
                      seals: formatGuildXp(contract.sealsReward, locale),
                    })}
                  </span>
                ) : null}
              </span>
            </div>
          </div>

          <div className={styles.acceptedDialogue}>
            <LinaDialogue
              speaker={t("guild.lina.name")}
              segments={getLinaLine(lina, t)}
              variant="modal"
              startDelayMs={1000}
              actions={
                <>
                  <PixelButton variant="ghost-dark" onClick={onClose}>
                    {t("guild.accepted.backToBoard")}
                  </PixelButton>
                  <PixelButton onClick={onViewContracts}>
                    {t("guild.accepted.viewContracts")}
                  </PixelButton>
                </>
              }
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
