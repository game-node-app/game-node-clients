import { useMemo, useState } from "react";
import type { TFunction } from "i18next";
import type { GuildChainDto, GuildChainStageDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useCollectionEntriesForUserId } from "#@/components/collection/collection-entry/hooks/useCollectionEntriesForUserId";
import { useGames } from "#@/components/game/hooks/useGames";
import { getCoverUrl } from "#@/components/game/util/getCoverUrl";
import { cn, Link, Modal } from "#@/util";

import guildStyles from "../guild.module.css";
import styles from "./GuildArcsBounties.module.css";
import { GameSearchSelectModal } from "../../game/search/modal/GameSearchSelectModal";
import { useAdvanceGuildChain } from "../hooks/useAdvanceGuildChain";
import { useGuildChains } from "../hooks/useGuildChains";
import { useStartGuildChain } from "../hooks/useStartGuildChain";
import { GuildIcon } from "../scene/GuildIcon";
import { GuildRewardArt } from "../scene/GuildRewardArt";
import { PixelButton } from "../scene/PixelButton";
import { getRarityClass } from "../scene/cosmeticAssets";
import { formatGuildXp, getRewardLabel } from "../util";
import { GuildQueryError } from "./GuildQueryError";

type Translate = (key: string, options?: Record<string, unknown>) => string;

function translate(
  t: TFunction,
  key: string,
  options?: Record<string, unknown>,
): string {
  return (t as unknown as Translate)(key, options);
}

/** Unknown server keys degrade to a readable label instead of disappearing. */
function humanizeKey(key: string): string {
  return key.replace(/[_-]+/g, " ").trim();
}

function getChainKey(chain: GuildChainDto): string {
  // Swagger types `chainKey` as an object although the server sends a string.
  return String(chain.chainKey);
}

function getChainCopy(
  chain: GuildChainDto,
  t: TFunction,
): { title: string; description: string } {
  const chainKey = getChainKey(chain);
  const titleKey = `guild.chains.${chainKey}.title`;
  const descriptionKey = `guild.chains.${chainKey}.description`;
  const title = translate(t, titleKey);
  const description = translate(t, descriptionKey);

  return {
    title: title === titleKey ? humanizeKey(chainKey) : title,
    description: description === descriptionKey ? "" : description,
  };
}

function getStageCopy(
  stage: GuildChainStageDto,
  t: TFunction,
): { title: string; objective: string } {
  const titleKey = `guild.chains.stages.${stage.stageKey}.title`;
  const objectiveKey = `guild.chains.stages.${stage.stageKey}.objective`;
  const title = translate(t, titleKey);
  const objective = translate(t, objectiveKey);

  return {
    title: title === titleKey ? humanizeKey(stage.stageKey) : title,
    objective: objective === objectiveKey ? "" : objective,
  };
}

function getStatusLabel(status: string, t: TFunction): string {
  const key = `guild.chains.status.${status}`;
  const label = translate(t, key);

  return label === key ? humanizeKey(status) : label;
}

const STATUS_CLASSES: Record<string, string | undefined> = {
  locked: styles.statusLocked,
  available: styles.statusAvailable,
  in_progress: styles.statusInProgress,
  completed: styles.statusCompleted,
};

type StageState = "done" | "current" | "upcoming";

/**
 * Stage track state (design D9): locked chains only preview their stages and
 * completed ones mark the whole track as done.
 */
function getStageState(chain: GuildChainDto, index: number): StageState {
  const status = chain.status as string;

  if (status === "completed") return "done";
  if (status === "locked") return "upcoming";
  if (index < chain.currentStageIndex) return "done";
  if (index === chain.currentStageIndex) return "current";

  return "upcoming";
}

/** Stage currently attempted (or next to start/retry); `null` when completed. */
function getCurrentStage(chain: GuildChainDto): GuildChainStageDto | null {
  if ((chain.status as string) === "completed") return null;

  return (
    chain.stages.find((stage) => stage.index === chain.currentStageIndex) ??
    chain.stages[chain.currentStageIndex] ??
    chain.stages[0] ??
    null
  );
}

/** True when the stage needs a library game that the chain has not bound yet. */
function stageNeedsGame(
  chain: GuildChainDto,
  stage: GuildChainStageDto | null,
): boolean {
  return (
    stage?.usesBoundTargetGame === true &&
    chain.boundTargetGameId == null &&
    chain.boundGame == null
  );
}

/**
 * `retry` keeps the current stage after an abandon/expiry (first stage still
 * unclaimed), `advance` starts the next one once the previous was claimed.
 */
function getAdvanceLabel(chain: GuildChainDto, t: TFunction): string {
  return chain.currentStageIndex > 0
    ? t("guild.chains.advance")
    : t("guild.chains.retry");
}

/**
 * The chain DTO has no completion instant yet; read it defensively so a future
 * additive `completedAt` is shown without a client change.
 */
function getCompletedAt(chain: GuildChainDto): string | null {
  const value = (chain as GuildChainDto & { completedAt?: string | null })
    .completedAt;

  return typeof value === "string" ? value : null;
}

function formatDate(value: string, locale: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function RarityTag({ rarity }: { rarity?: string | null }) {
  const { t } = useTranslation();

  if (!rarity) return null;

  const key = `guild.rarity.${rarity}`;
  const label = translate(t, key);

  if (label === key) return null;

  return (
    <span className={styles.rarityTag} data-rarity={rarity}>
      {label}
    </span>
  );
}

type PickerMode = "start" | "advance";

interface PendingPicker {
  chain: GuildChainDto;
  mode: PickerMode;
}

interface ChainPanelProps {
  chain: GuildChainDto;
  locale: string;
  pending: boolean;
  onAction: (chain: GuildChainDto) => void;
  onViewContract: () => void;
}

function ChainPanel({
  chain,
  locale,
  pending,
  onAction,
  onViewContract,
}: ChainPanelProps) {
  const { t } = useTranslation();
  const chainKey = getChainKey(chain);
  const status = chain.status as string;
  const copy = getChainCopy(chain, t);
  const currentStage = getCurrentStage(chain);
  const currentStageCopy = currentStage ? getStageCopy(currentStage, t) : null;
  const completedAt = getCompletedAt(chain);

  return (
    <article
      className={styles.card}
      data-chain-key={chainKey}
      data-chain-status={status}
      data-chain-pending={pending ? "true" : undefined}
    >
      <header className={styles.cardHeader}>
        <div className={styles.headings}>
          <h3 className={cn(guildStyles.pixelCardTitle, styles.cardTitle)}>
            {copy.title}
          </h3>
          <span
            className={cn(styles.statusTag, STATUS_CLASSES[status])}
            data-chain-status-tag={status}
          >
            {getStatusLabel(status, t)}
          </span>
        </div>
      </header>

      {copy.description ? (
        <p className={styles.description}>{copy.description}</p>
      ) : null}

      <ol
        className={styles.stages}
        aria-label={t("guild.chains.stageOf", {
          current: Math.min(chain.currentStageIndex + 1, chain.totalStages),
          total: chain.totalStages,
        })}
      >
        {chain.stages.map((stage) => {
          const state = getStageState(chain, stage.index);
          const stageCopy = getStageCopy(stage, t);

          return (
            <li
              key={stage.stageKey}
              className={cn(
                styles.stage,
                state === "done" && styles.stageDone,
                state === "current" && styles.stageCurrent,
              )}
              data-stage-index={stage.index}
              data-stage-state={state}
              title={stageCopy.objective || undefined}
            >
              <span className={styles.stageIndex} aria-hidden>
                {state === "done" ? "\u2713" : stage.index + 1}
              </span>
              <span className={styles.stageTitle}>{stageCopy.title}</span>
            </li>
          );
        })}
      </ol>

      {currentStage && currentStageCopy ? (
        <div
          className={styles.stageDetail}
          data-current-stage={currentStage.index}
        >
          <div className={styles.stageDetailHead}>
            <span className={styles.overline}>
              {t("guild.chains.stageOf", {
                current: currentStage.index + 1,
                total: chain.totalStages,
              })}
            </span>
            <span
              className={cn(guildStyles.pixelLabel, styles.stageDetailTitle)}
            >
              {currentStageCopy.title}
            </span>
          </div>
          {currentStageCopy.objective ? (
            <p className={styles.stageObjective}>
              {currentStageCopy.objective}
            </p>
          ) : null}
          <p className={styles.stageRewards} data-stage-rewards>
            <GuildIcon name="coin" size={14} />
            {t("guild.chains.stageRewards", {
              xp: formatGuildXp(currentStage.xpReward, locale),
              seals: formatGuildXp(currentStage.sealsReward, locale),
              days: currentStage.durationDays,
            })}
          </p>
        </div>
      ) : null}

      {chain.boundGame ? (
        <Link
          href={`/game/${chain.boundGame.gameId}`}
          className={styles.boundGame}
          data-bound-game={chain.boundGame.gameId}
        >
          {chain.boundGame.coverUrl ? (
            <img
              src={chain.boundGame.coverUrl}
              alt=""
              width={20}
              height={27}
              loading="lazy"
              draggable={false}
              className={styles.boundGameCover}
            />
          ) : (
            <span className={styles.boundGameCoverFallback} aria-hidden />
          )}
          <span className={styles.boundGameLabel}>
            {t("guild.chains.boundGame", { name: chain.boundGame.name })}
          </span>
        </Link>
      ) : null}

      <div className={styles.finalRewards} data-final-rewards>
        <span className={styles.overline}>
          {t("guild.chains.finalRewards")}
        </span>
        {chain.finalRewards.length > 0 ? (
          <ul className={styles.finalRewardList}>
            {chain.finalRewards.map((reward) => (
              <li
                key={reward.id ?? reward.key}
                className={cn(
                  styles.finalReward,
                  getRarityClass(reward.rarity),
                )}
                data-reward-key={reward.key}
              >
                <GuildRewardArt
                  kind={reward.kind}
                  rewardKey={reward.key}
                  consumableKey={reward.consumableKey}
                  size={14}
                />
                <span>{getRewardLabel(reward, t)}</span>
                <RarityTag rarity={reward.rarity} />
              </li>
            ))}
          </ul>
        ) : null}
        {chain.finalBonusSeals > 0 ? (
          <span className={styles.finalSeals} data-final-seals>
            <GuildIcon name="seal" size={16} />
            {t("guild.chains.finalSeals", {
              seals: formatGuildXp(chain.finalBonusSeals, locale),
            })}
          </span>
        ) : null}
      </div>

      {status === "completed" ? (
        <div className={styles.completedStamp} data-chain-completed>
          <span className={cn(guildStyles.stamp, styles.completedStampText)}>
            {t("guild.chains.completedOn")}
          </span>
          {completedAt ? (
            <span className={styles.completedDate} data-completed-date>
              {formatDate(completedAt, locale)}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className={styles.actions}>
        {status === "locked" ? (
          <PixelButton
            size="sm"
            disabled
            data-chain-action="locked"
            data-chain-key={chainKey}
          >
            {t("guild.chains.minRank", { rank: chain.minRank })}
          </PixelButton>
        ) : status === "completed" ? null : status === "in_progress" &&
          chain.activeContractId ? (
          <PixelButton
            size="sm"
            onClick={onViewContract}
            data-chain-action="view-contract"
            data-chain-key={chainKey}
          >
            {t("guild.chains.viewContract")}
          </PixelButton>
        ) : status === "available" || status === "in_progress" ? (
          <>
            <PixelButton
              size="sm"
              onClick={() => onAction(chain)}
              disabled={pending}
              data-chain-action={status === "available" ? "start" : "advance"}
              data-chain-key={chainKey}
            >
              {status === "available"
                ? t("guild.chains.start")
                : getAdvanceLabel(chain, t)}
            </PixelButton>
            {status === "available" &&
            stageNeedsGame(chain, chain.stages[0] ?? null) ? (
              <p className={styles.actionHint} data-pick-game-hint>
                {t("guild.chains.pickGame")} · {t("guild.chains.pickGameHint")}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </article>
  );
}

export interface GuildChainsProps {
  /** Switches the hall to the Accepted tab after a stage contract is created. */
  onShowAccepted?: () => void;
  className?: string;
}

/**
 * Lina's Arcs (design D9): one parchment panel per Quest Chain with its
 * localized copy, status, three-stage track, current stage objective/rewards,
 * bound game and final rewards. Start/advance bind a library game first when
 * the stage needs one; success opens the Accepted tab.
 */
export function GuildChains({ onShowAccepted, className }: GuildChainsProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const userId = useUserId();
  const chainsQuery = useGuildChains();
  const start = useStartGuildChain();
  const advance = useAdvanceGuildChain();
  const [picker, setPicker] = useState<PendingPicker | null>(null);
  const [showFullSearch, setShowFullSearch] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");

  const entriesQuery = useCollectionEntriesForUserId({
    userId: picker !== null ? userId : undefined,
    offset: 0,
    limit: 50,
    orderBy: { addedDate: "DESC" },
  });

  const libraryGameIds = useMemo(() => {
    const entries = entriesQuery.data?.data ?? [];
    return entries.map((entry) => entry.gameId);
  }, [entriesQuery.data]);

  const gamesQuery = useGames(
    {
      gameIds: libraryGameIds.length > 0 ? libraryGameIds : undefined,
      relations: { cover: true },
    },
    false,
  );

  const libraryGames = useMemo(() => {
    const games = gamesQuery.data ?? [];
    const byId = new Map(games.map((game) => [game.id, game]));
    return libraryGameIds
      .map((id) => byId.get(id))
      .filter((game): game is NonNullable<typeof game> => Boolean(game));
  }, [gamesQuery.data, libraryGameIds]);

  const filteredLibraryGames = useMemo(() => {
    const normalized = librarySearch.trim().toLowerCase();
    if (!normalized) return libraryGames;
    return libraryGames.filter((game) =>
      (game.name ?? "").toLowerCase().includes(normalized),
    );
  }, [libraryGames, librarySearch]);

  const libraryLoading =
    picker !== null &&
    Boolean(userId) &&
    (entriesQuery.isPending ||
      (libraryGameIds.length > 0 && gamesQuery.isPending));
  const showLibraryPicker =
    picker !== null && !showFullSearch && libraryGames.length > 0;
  const showFullSearchModal =
    picker !== null &&
    (showFullSearch || (!libraryLoading && libraryGames.length === 0));

  const chains = chainsQuery.data?.chains ?? [];
  const pendingChainKey = start.isPending
    ? start.variables?.chainKey
    : advance.isPending
      ? advance.variables?.chainKey
      : undefined;

  const closePicker = () => {
    setPicker(null);
    setShowFullSearch(false);
    setLibrarySearch("");
  };

  const runAction = (
    chain: GuildChainDto,
    mode: PickerMode,
    targetGameId?: number,
  ) => {
    const variables = {
      chainKey: getChainKey(chain),
      ...(targetGameId !== undefined ? { targetGameId } : {}),
    };
    const options = {
      onSuccess: () => {
        closePicker();
        onShowAccepted?.();
      },
    };

    if (mode === "start") {
      start.mutate(variables, options);
    } else {
      advance.mutate(variables, options);
    }
  };

  const handleAction = (chain: GuildChainDto) => {
    const status = chain.status as string;

    if (status === "available") {
      if (stageNeedsGame(chain, chain.stages[0] ?? null)) {
        setShowFullSearch(false);
        setLibrarySearch("");
        setPicker({ chain, mode: "start" });
        return;
      }

      runAction(chain, "start");
      return;
    }

    if (status === "in_progress") {
      if (stageNeedsGame(chain, getCurrentStage(chain))) {
        setShowFullSearch(false);
        setLibrarySearch("");
        setPicker({ chain, mode: "advance" });
        return;
      }

      runAction(chain, "advance");
    }
  };

  const handleGameSelected = (targetGameId: number) => {
    const target = picker;
    closePicker();

    if (target) {
      runAction(target.chain, target.mode, targetGameId);
    }
  };

  return (
    <section
      className={cn(styles.section, className)}
      aria-busy={chainsQuery.isPending || undefined}
    >
      <header className={styles.header}>
        <h2 className={cn(guildStyles.pixelTitle, styles.title)}>
          {t("guild.chains.tabTitle")}
        </h2>
      </header>

      {chainsQuery.isPending && !chainsQuery.data ? (
        <p className={styles.loading} role="status">
          {t("common.loading")}
        </p>
      ) : chainsQuery.isError && !chainsQuery.data ? (
        <GuildQueryError
          error={chainsQuery.error}
          onRetry={() => {
            void chainsQuery.refetch();
          }}
          isRetrying={chainsQuery.isFetching}
        />
      ) : chains.length === 0 ? (
        <p className={styles.empty}>{t("guild.chains.empty")}</p>
      ) : (
        <div className={styles.list}>
          {chains.map((chain) => (
            <ChainPanel
              key={getChainKey(chain)}
              chain={chain}
              locale={locale}
              pending={pendingChainKey === getChainKey(chain)}
              onAction={handleAction}
              onViewContract={() => onShowAccepted?.()}
            />
          ))}
        </div>
      )}

      <Modal
        opened={showLibraryPicker}
        onClose={closePicker}
        title={t("guild.chains.pickGame")}
        centered
        size="md"
      >
        <div className={styles.libraryPicker} data-chain-library-picker>
          <p className={styles.libraryHint}>
            {t("guild.chains.libraryOnlyHint")}
          </p>
          <input
            type="search"
            className={styles.librarySearch}
            value={librarySearch}
            onChange={(event) => setLibrarySearch(event.currentTarget.value)}
            placeholder={t("common.searchPlaceholder")}
            aria-label={t("common.search")}
          />
          {filteredLibraryGames.length === 0 ? (
            <p className={styles.libraryEmpty}>{t("common.noResults")}</p>
          ) : (
            <ul className={styles.libraryList}>
              {filteredLibraryGames.map((game) => {
                const coverUrl = getCoverUrl(game);

                return (
                  <li key={game.id}>
                    <button
                      type="button"
                      className={styles.libraryOption}
                      data-library-game-id={game.id}
                      onClick={() => handleGameSelected(game.id)}
                    >
                      <span className={styles.libraryOptionMain}>
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt=""
                            width={20}
                            height={27}
                            loading="lazy"
                            draggable={false}
                            className={styles.boundGameCover}
                          />
                        ) : (
                          <span
                            className={styles.boundGameCoverFallback}
                            aria-hidden
                          />
                        )}
                        <span className={styles.libraryOptionTitle}>
                          {game.name}
                        </span>
                      </span>
                      <span className={styles.libraryBadge}>
                        {t("guild.chains.inLibrary")}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className={styles.libraryFooter}>
            <PixelButton size="sm" variant="ghost-dark" onClick={closePicker}>
              {t("actions.cancel")}
            </PixelButton>
            <PixelButton
              size="sm"
              onClick={() => setShowFullSearch(true)}
              data-chain-open-full-search
            >
              {t("console.search.title")}
            </PixelButton>
          </div>
        </div>
      </Modal>

      <GameSearchSelectModal
        opened={showFullSearchModal}
        onClose={closePicker}
        onSelected={handleGameSelected}
      />
    </section>
  );
}
