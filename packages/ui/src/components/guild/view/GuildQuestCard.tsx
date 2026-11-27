import type { CSSProperties } from "react";
import type { TFunction } from "i18next";
import type {
  GuildBoardBonusObjectiveDto,
  GuildBoardCandidateGameDto,
  GuildBoardQuestDto,
} from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn } from "#@/util/cn";

import styles from "../guild.module.css";
import expansionStyles from "./GuildBoardExpansion.module.css";
import { CategoryTag } from "../scene/CategoryTag";
import { GameChip } from "../scene/GameChip";
import { GuildIcon } from "../scene/GuildIcon";
import { PixelButton } from "../scene/PixelButton";
import { RankStamp } from "../scene/RankStamp";
import type { GuildAssetName } from "../scene/assets";
import { formatGuildXp } from "../util/getRankProgress";
import { getQuestCopy, getQuestMetaCaptions } from "../util/getQuestCopy";
import { getRewardLabel } from "../util/getRewardLabel";

export interface GuildQuestCardProps {
  quest: GuildBoardQuestDto;
  /** Board position, used by the staggered card entrance (index * 60 ms). */
  index: number;
  onAccept: (quest: GuildBoardQuestDto) => void;
  onNotNow: (quest: GuildBoardQuestDto) => void;
  accepting?: boolean;
  atCap?: boolean;
  /**
   * Present only when the card is rerollable and the board has a free reroll
   * or a Reroll Charter left (design D6).
   */
  onReroll?: (quest: GuildBoardQuestDto) => void;
  /** Label stating what the reroll spends (free reroll or charter). */
  rerollLabel?: string;
  rerolling?: boolean;
  className?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Quest icon by category/template (design D4). */
function getQuestIcon(quest: GuildBoardQuestDto): GuildAssetName {
  if (quest.templateKey === "deep_dive") return "book";

  switch (quest.category) {
    case "library":
      return "book";
    case "event":
      return "hourglass";
    case "weekly":
      return "trophy";
    case "gamenode":
      return "quill";
    case "monthly":
      return "star";
    default:
      return "scroll";
  }
}

function isMonthlyQuest(quest: GuildBoardQuestDto): boolean {
  return quest.cycle === "monthly" || quest.category === "monthly";
}

function getEventDaysLeft(expiresAt: string): number {
  const expiresAtMs = new Date(expiresAt).getTime();
  if (Number.isNaN(expiresAtMs)) return 0;

  return Math.max(0, Math.ceil((expiresAtMs - Date.now()) / DAY_MS));
}

/** "Accept by December 1" / "Aceite até 1 de dezembro". */
function formatAcceptBy(expiresAt: string, locale: string): string | null {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
  });
}

function getCandidateMeta(
  game: GuildBoardCandidateGameDto,
  t: TFunction,
): string | undefined {
  if (game.sinceYear !== undefined && game.sinceYear !== null) {
    return t("guild.board.chips.since", { year: game.sinceYear });
  }

  if (game.estimatedHours !== undefined && game.estimatedHours !== null) {
    return t("guild.board.chips.hours", { hours: game.estimatedHours });
  }

  return undefined;
}

/** Localized condition of a bonus objective (hand-off 8.1 / design D6). */
function getBonusCondition(
  bonus: GuildBoardBonusObjectiveDto,
  t: TFunction,
): string | null {
  switch (bonus.type) {
    case "also_write_review":
      return t("guild.board.bonus.also_write_review", {
        chars: bonus.minChars ?? 150,
      });
    case "finish_before_half_deadline":
      return t("guild.board.bonus.finish_before_half_deadline");
    case "use_stale_backlog_game":
      return t("guild.board.bonus.use_stale_backlog_game", {
        days: bonus.staleDays ?? 180,
      });
    default:
      return null;
  }
}

function getBonusRewardParts(
  bonus: GuildBoardBonusObjectiveDto,
  t: TFunction,
  locale: string,
): string[] {
  const parts: string[] = [];

  if (bonus.bonusXp) {
    parts.push(
      t("guild.board.bonus.parts.xp", {
        xp: formatGuildXp(bonus.bonusXp, locale),
      }),
    );
  }

  if (bonus.bonusSeals) {
    parts.push(
      t("guild.board.bonus.parts.seals", {
        seals: formatGuildXp(bonus.bonusSeals, locale),
      }),
    );
  }

  if (bonus.upgradeChestTier) {
    parts.push(t("guild.board.bonus.parts.chestUpgrade"));
  }

  return parts;
}

/**
 * Parchment quest card (design D6): category tag, icon tile, localized title
 * and description, rank stamp, candidate game chips, meta captions, the
 * optional bonus objective, the XP/Seals/reward footer and the "Not now" /
 * "Reroll" / "Accept" actions. Recommended cards add the brand border, the
 * highlighted pin and Lina's seal. Monthly Expeditions span the full board.
 */
export function GuildQuestCard({
  quest,
  index,
  onAccept,
  onNotNow,
  accepting = false,
  atCap = false,
  onReroll,
  rerollLabel,
  rerolling = false,
  className,
}: GuildQuestCardProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const copy = getQuestCopy(quest, t, language);
  const rewardLabel = getRewardLabel(quest.reward, t);
  const icon = getQuestIcon(quest);
  const iconElement = <GuildIcon name={icon} size={32} />;
  const monthly = isMonthlyQuest(quest);

  const tagLabel = monthly
    ? t("guild.board.tags.monthly")
    : quest.category === "event"
      ? t("guild.board.tags.event", { days: getEventDaysLeft(quest.expiresAt) })
      : quest.category === "weekly"
        ? t("guild.board.tags.weekly")
        : quest.category === "gamenode"
          ? t("guild.board.tags.gamenode")
          : t("guild.board.tags.library");

  // A board quest's `expiresAt` is only the accept deadline; the contract
  // duration comes from `contractDurationDays` (D10). Events end at `endsAt`.
  const contractDurationLabel =
    quest.category !== "event" && quest.contractDurationDays != null
      ? t("guild.board.duration", { count: quest.contractDurationDays })
      : null;
  const acceptByDate = monthly
    ? formatAcceptBy(quest.expiresAt, language)
    : null;
  const acceptByLabel = acceptByDate
    ? t("guild.board.monthly.acceptBy", { date: acceptByDate })
    : null;
  const ruleCaption =
    quest.objectiveType === "write_review"
      ? t("guild.board.rules.review")
      : quest.objectiveType === "finish_game"
        ? t("guild.board.rules.finish")
        : null;

  const metaCaptions = getQuestMetaCaptions(quest.meta, t);
  if (quest.candidateGames.length === 0) {
    if (quest.meta?.sinceYear != null) {
      metaCaptions.push(
        t("guild.board.chips.since", { year: quest.meta.sinceYear }),
      );
    }

    if (quest.meta?.estimatedHours != null) {
      metaCaptions.push(
        t("guild.board.chips.hours", { hours: quest.meta.estimatedHours }),
      );
    }
  }

  const bonusCondition = quest.bonusObjective
    ? getBonusCondition(quest.bonusObjective, t)
    : null;
  const bonusRewardParts = quest.bonusObjective
    ? getBonusRewardParts(quest.bonusObjective, t, language)
    : [];

  return (
    <article
      className={cn(
        styles.questCard,
        styles.animCardEnter,
        quest.isRecommended && styles.questCardRecommended,
        monthly && expansionStyles.monthlyCard,
        className,
      )}
      data-quest-id={quest.boardEntryId ?? quest.eventId ?? undefined}
      data-recommended={quest.isRecommended ? "true" : undefined}
      data-cycle={quest.cycle ?? undefined}
      data-monthly={monthly ? "true" : undefined}
      aria-busy={rerolling || undefined}
      style={
        {
          "--guild-enter-delay": `${index * 60}ms`,
        } as CSSProperties
      }
    >
      <span className={styles.questPin} aria-hidden>
        <GuildIcon
          name={quest.isRecommended ? "pin-highlight" : "pin"}
          size={12}
        />
      </span>
      {quest.isRecommended ? (
        <span className={cn(styles.pixelLabel, styles.questSeal)}>
          {t("guild.board.recommended")}
        </span>
      ) : null}

      <div className={styles.questHeader}>
        <span className={styles.questIcon}>{iconElement}</span>
        <div className={styles.questHeading}>
          <CategoryTag category={quest.category}>{tagLabel}</CategoryTag>
          <h3 className={cn(styles.pixelCardTitle, styles.questTitle)}>
            {copy.title}
          </h3>
        </div>
        <RankStamp rank={quest.rank} />
      </div>

      {copy.description ? (
        <p className={cn(styles.bodyText, styles.questDescription)}>
          {copy.description}
        </p>
      ) : null}

      {metaCaptions.length > 0 ? (
        <div className={expansionStyles.metaRow}>
          {metaCaptions.map((caption, captionIndex) => (
            <p
              key={`${caption}-${captionIndex}`}
              className={expansionStyles.metaCaption}
            >
              {caption}
            </p>
          ))}
        </div>
      ) : null}

      {acceptByLabel || contractDurationLabel || ruleCaption ? (
        <div>
          {acceptByLabel ? (
            <p className={expansionStyles.acceptBy}>{acceptByLabel}</p>
          ) : null}
          {contractDurationLabel ? (
            <p className={cn(styles.captionText, styles.questDescription)}>
              {contractDurationLabel}
            </p>
          ) : null}
          {ruleCaption ? (
            <p className={cn(styles.captionText, styles.questDescription)}>
              {ruleCaption}
            </p>
          ) : null}
        </div>
      ) : null}

      {quest.bonusObjective ? (
        <aside
          className={expansionStyles.bonusBox}
          data-bonus-type={quest.bonusObjective.type}
        >
          <span className={expansionStyles.bonusLabel}>
            {t("guild.board.bonus.label")}
          </span>
          {bonusCondition ? (
            <p className={expansionStyles.bonusCondition}>{bonusCondition}</p>
          ) : null}
          {bonusRewardParts.length > 0 ? (
            <p className={expansionStyles.bonusReward}>
              {t("guild.board.bonus.reward")}: {bonusRewardParts.join(" · ")}
            </p>
          ) : null}
        </aside>
      ) : null}

      {quest.candidateGames.length > 0 ? (
        <div className={styles.questChips}>
          {quest.candidateGames.slice(0, 3).map((game, gameIndex) => (
            <GameChip
              key={game.gameId}
              gameId={game.gameId}
              name={game.name || `#${game.gameId}`}
              coverUrl={game.coverUrl}
              meta={
                getCandidateMeta(game, t) ??
                (gameIndex === 0 && quest.meta?.sinceYear != null
                  ? t("guild.board.chips.since", {
                      year: quest.meta.sinceYear,
                    })
                  : undefined)
              }
            />
          ))}
        </div>
      ) : null}

      <div className={styles.questFooter}>
        <div className={styles.questRewards}>
          <span className={cn(styles.pixelLabel, styles.questXp)}>
            <GuildIcon name="coin" size={20} />
            {t("guild.board.xpReward", {
              xp: formatGuildXp(quest.xpReward, language),
            })}
          </span>
          {quest.sealsReward > 0 ? (
            <span
              className={cn(styles.pixelLabel, expansionStyles.sealsReward)}
            >
              <GuildIcon name="seal" size={18} />
              {t("guild.seals.reward", {
                seals: formatGuildXp(quest.sealsReward, language),
              })}
            </span>
          ) : null}
          {rewardLabel ? (
            <span className={cn(styles.captionText, styles.questRewardLabel)}>
              {rewardLabel}
            </span>
          ) : null}
        </div>
        <div className={styles.questActions}>
          {onReroll ? (
            <PixelButton
              variant="ghost"
              size="sm"
              disabled={accepting || rerolling}
              leftSection={<GuildIcon name="reroll-charter" size={14} />}
              onClick={() => onReroll(quest)}
            >
              {rerollLabel ?? t("guild.board.reroll.action")}
            </PixelButton>
          ) : null}
          <PixelButton
            variant="ghost"
            size="sm"
            onClick={() => onNotNow(quest)}
          >
            {t("guild.actions.notNow")}
          </PixelButton>
          <PixelButton
            size="sm"
            disabled={accepting || rerolling || atCap}
            onClick={() => {
              if (!atCap) onAccept(quest);
            }}
          >
            {t("guild.actions.accept")}
          </PixelButton>
        </div>
      </div>
    </article>
  );
}
