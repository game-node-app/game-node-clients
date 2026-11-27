import { useState } from "react";
import { Skeleton } from "@mantine/core";
import type { TFunction } from "i18next";
import type {
  GuildEmporiumListingDto,
  GuildEmporiumPurchaseResponseDto,
  GuildRewardDescriptorDto,
} from "@repo/wrapper/server";
import { GuildRewardDescriptorDto as RewardKind } from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import styles from "../guild.module.css";
import economyStyles from "./GuildEconomy.module.css";
import { useGuildEmporium } from "../hooks/useGuildEmporium";
import { useGuildOverview } from "../hooks/useGuildOverview";
import { usePurchaseGuildEmporiumItem } from "../hooks/usePurchaseGuildEmporiumItem";
import { getRarityClass } from "../scene/cosmeticAssets";
import { GuildIcon } from "../scene/GuildIcon";
import { GuildRewardArt } from "../scene/GuildRewardArt";
import { PixelButton } from "../scene/PixelButton";
import { formatTimeLeft, getRewardLabel } from "../util";
import { GuildChestResult } from "./GuildChestResult";
import { GuildQueryError } from "./GuildQueryError";

export interface GuildEmporiumProps {
  className?: string;
}

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Dynamic keys (reward kind, rarity) bypass the typed key union. */
function translate(
  t: TFunction,
  key: string,
  options?: Record<string, unknown>,
): string {
  return (t as unknown as Translate)(key, options);
}

const RANK_ORDER = ["E", "D", "C", "B", "A", "S"] as const;

const GENERIC_KIND_KEYS: Record<string, string> = {
  [RewardKind.kind.BADGE]: "badge",
  [RewardKind.kind.TITLE]: "title",
  [RewardKind.kind.AVATAR_FRAME]: "frame",
  [RewardKind.kind.LICENSE_THEME]: "license_theme",
  [RewardKind.kind.STAMP_STYLE]: "stamp_style",
  [RewardKind.kind.TAVERN_DECOR]: "tavern_decor",
  [RewardKind.kind.CONSUMABLE]: "consumable",
  [RewardKind.kind.WEEKLY_CHEST]: "chest",
  [RewardKind.kind.CHEST_BRONZE]: "chest",
  [RewardKind.kind.CHEST_SILVER]: "chest",
  [RewardKind.kind.CHEST_GOLD]: "chest",
  [RewardKind.kind.CHEST_RELIC]: "chest",
};

/** `guild.rewards.generic.<kind>` with the badge fallback of the reward label. */
function getKindLabel(reward: GuildRewardDescriptorDto, t: TFunction): string {
  const generic = GENERIC_KIND_KEYS[reward.kind] ?? "badge";
  const key = `guild.rewards.generic.${generic}`;
  const translated = translate(t, key);

  if (translated !== key) return translated;

  return translate(t, "guild.rewards.generic.badge");
}

function getRarityLabel(rarity: string, t: TFunction): string {
  return translate(t, `guild.rarity.${rarity}`);
}

function isRankAbove(userRank: string | undefined, minRank: string): boolean {
  if (!userRank) return false;

  const userIndex = RANK_ORDER.indexOf(userRank as (typeof RANK_ORDER)[number]);
  const minIndex = RANK_ORDER.indexOf(minRank as (typeof RANK_ORDER)[number]);

  return minIndex > userIndex;
}

interface BlockedListingReason {
  dataState: "owned" | "monthly-limit-reached" | "rank" | "insufficient-seals";
  tone: "owned" | "warning";
  label: string;
}

/**
 * Resolves why a listing cannot be purchased so `.itemActions` renders a
 * non-interactive status pill instead of a disabled Buy button.
 */
function getBlockedReason(
  listing: GuildEmporiumListingDto,
  userRank: string | undefined,
  t: TFunction,
): BlockedListingReason | null {
  if (listing.owned) {
    return {
      dataState: "owned",
      tone: "owned",
      label: translate(t, "guild.emporium.owned"),
    };
  }

  if (
    listing.maxPurchasesPerMonth !== null &&
    listing.purchasedThisMonth >= listing.maxPurchasesPerMonth
  ) {
    return {
      dataState: "monthly-limit-reached",
      tone: "warning",
      label: translate(t, "guild.emporium.soldOut"),
    };
  }

  if (isRankAbove(userRank, listing.minRank)) {
    return {
      dataState: "rank",
      tone: "warning",
      label: translate(t, "guild.emporium.minRank", {
        rank: listing.minRank,
      }),
    };
  }

  if (!listing.canPurchase) {
    return {
      dataState: "insufficient-seals",
      tone: "warning",
      label: translate(t, "guild.emporium.notEnoughSeals"),
    };
  }

  return null;
}

interface MonthlyLimitState {
  dataState: "monthly-limit" | "monthly-limit-reached";
  tone: "neutral" | "warning";
  label: string;
}

function getMonthlyLimitState(
  listing: GuildEmporiumListingDto,
  t: TFunction,
): MonthlyLimitState | null {
  if (listing.owned || listing.maxPurchasesPerMonth === null) {
    return null;
  }

  const limitReached =
    listing.purchasedThisMonth >= listing.maxPurchasesPerMonth;

  return {
    dataState: limitReached ? "monthly-limit-reached" : "monthly-limit",
    tone: limitReached ? "warning" : "neutral",
    label: translate(t, "guild.emporium.monthlyLimit", {
      count: listing.purchasedThisMonth,
      max: listing.maxPurchasesPerMonth,
    }),
  };
}

interface EmporiumItemProps {
  listing: GuildEmporiumListingDto;
  userRank: string | undefined;
  numberFormat: Intl.NumberFormat;
  buying: boolean;
  onBuy(listing: GuildEmporiumListingDto): void;
}

function EmporiumItem({
  listing,
  userRank,
  numberFormat,
  buying,
  onBuy,
}: EmporiumItemProps) {
  const { t } = useTranslation();
  const blocked = getBlockedReason(listing, userRank, t);
  const monthlyState = getMonthlyLimitState(listing, t);
  const label = getRewardLabel(listing.reward, t);
  const itemState =
    blocked?.dataState ?? monthlyState?.dataState ?? "available";

  return (
    <li
      className={economyStyles.itemCard}
      data-emporium-item={listing.id}
      data-emporium-state={itemState}
      data-reward-key={listing.reward.key}
      data-can-purchase={String(listing.canPurchase)}
    >
      <div className={economyStyles.itemArt}>
        <GuildRewardArt
          kind={listing.reward.kind}
          rewardKey={listing.reward.key}
          consumableKey={listing.reward.consumableKey}
          size={34}
        />
      </div>

      <div className={economyStyles.itemBody}>
        <span className={economyStyles.itemName} data-reward-label>
          {label}
        </span>
        <span className={economyStyles.itemTags}>
          <span className={economyStyles.kindTag}>
            {getKindLabel(listing.reward, t)}
          </span>
          <span
            className={cn(
              economyStyles.rarityTag,
              getRarityClass(listing.reward.rarity),
            )}
            data-rarity={listing.reward.rarity}
          >
            {getRarityLabel(listing.reward.rarity, t)}
          </span>
        </span>
      </div>

      <p
        className={economyStyles.itemPrice}
        data-emporium-price={listing.priceSeals}
      >
        <GuildIcon name="seal" size={14} />
        <span className={economyStyles.itemPriceValue}>
          {numberFormat.format(listing.priceSeals)}
        </span>
      </p>

      {monthlyState ? (
        <p
          className={cn(
            economyStyles.itemState,
            monthlyState.tone === "neutral" && economyStyles.itemStateNeutral,
            monthlyState.tone === "warning" && economyStyles.itemStateWarning,
          )}
          data-emporium-state-label={monthlyState.dataState}
          data-emporium-state-tone={monthlyState.tone}
        >
          {monthlyState.label}
        </p>
      ) : null}

      <div className={economyStyles.itemActions}>
        {blocked ? (
          <span
            className={cn(
              economyStyles.statusPill,
              blocked.tone === "owned" && economyStyles.itemStateOwned,
              blocked.tone === "warning" && economyStyles.itemStateWarning,
            )}
            data-emporium-state-label={blocked.dataState}
            data-emporium-state-tone={blocked.tone}
          >
            {blocked.label}
          </span>
        ) : (
          <PixelButton
            size="sm"
            fullWidth
            disabled={buying}
            aria-label={`${t("guild.emporium.buy")}: ${label}`}
            onClick={() => onBuy(listing)}
          >
            {t("guild.emporium.buy")}
          </PixelButton>
        )}
      </div>
    </li>
  );
}

/**
 * Lina's Emporium (design D7, spec guild-economy): the Seals balance, the next
 * rotation countdown and the two shelves (monthly showcase and permanent
 * shelf). Buying asks for confirmation with the price and resulting balance,
 * sends the listing id through `usePurchaseGuildEmporiumItem` and reports what
 * was granted, reusing `GuildChestResult` for chest listings.
 */
export function GuildEmporium({ className }: GuildEmporiumProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const emporium = useGuildEmporium();
  const overview = useGuildOverview();
  const purchase = usePurchaseGuildEmporiumItem();
  const [confirmListing, setConfirmListing] =
    useState<GuildEmporiumListingDto | null>(null);
  const [purchaseResult, setPurchaseResult] =
    useState<GuildEmporiumPurchaseResponseDto | null>(null);

  const numberFormat = new Intl.NumberFormat(language);
  const userRank = overview.data?.license?.rank;
  const data = emporium.data;
  const balance = data?.sealsBalance ?? 0;
  const remaining = confirmListing
    ? Math.max(balance - confirmListing.priceSeals, 0)
    : 0;

  const openConfirm = (listing: GuildEmporiumListingDto) => {
    setPurchaseResult(null);
    setConfirmListing(listing);
  };

  const confirmPurchase = () => {
    if (!confirmListing) return;

    purchase.mutate(
      { emporiumItemId: confirmListing.id },
      {
        onSuccess: (result) => {
          setConfirmListing(null);
          setPurchaseResult(result);
        },
        onError: () => setConfirmListing(null),
      },
    );
  };

  const renderShelf = (
    title: string,
    listings: GuildEmporiumListingDto[],
    shelfKey: string,
  ) => {
    if (listings.length === 0) return null;

    return (
      <section className={economyStyles.shelf} data-emporium-shelf={shelfKey}>
        <h3 className={cn(styles.captionMedium, economyStyles.shelfTitle)}>
          {title}
        </h3>
        <ul className={economyStyles.itemGrid}>
          {listings.map((listing) => (
            <EmporiumItem
              key={listing.id}
              listing={listing}
              userRank={userRank}
              numberFormat={numberFormat}
              buying={purchase.isPending}
              onBuy={openConfirm}
            />
          ))}
        </ul>
      </section>
    );
  };

  if (emporium.isPending) {
    return (
      <section className={cn(economyStyles.emporium, className)}>
        <Skeleton height={96} radius={8} />
        <Skeleton height={190} radius={8} />
      </section>
    );
  }

  if (!data) {
    return (
      <section className={cn(economyStyles.emporium, className)}>
        <GuildQueryError
          error={emporium.error}
          onRetry={() => {
            void emporium.refetch();
          }}
          isRetrying={emporium.isFetching}
        />
      </section>
    );
  }

  const isEmpty =
    data.permanentItems.length === 0 && data.rotatingItems.length === 0;

  return (
    <section className={cn(economyStyles.emporium, className)}>
      <header className={economyStyles.emporiumHeader}>
        <div className={economyStyles.emporiumTop}>
          <div className={economyStyles.emporiumHeading}>
            <h2 className={cn(styles.pixelCardTitle, economyStyles.title)}>
              {t("guild.emporium.title")}
            </h2>
            <p className={cn(styles.bodyText, economyStyles.subtitle)}>
              {t("guild.emporium.subtitle")}
            </p>
          </div>
          <div
            className={economyStyles.balancePill}
            data-seals-balance={balance}
            role="group"
            aria-label={t("guild.seals.amount", { count: balance })}
          >
            <GuildIcon name="seal" size={20} />
            <span className={economyStyles.balanceValue}>
              {numberFormat.format(balance)}
            </span>
            <span className={economyStyles.balanceLabel}>
              {t("guild.emporium.balance")}
            </span>
          </div>
        </div>
        <p className={economyStyles.rotation} data-emporium-rotation>
          {t("guild.emporium.rotatesIn", {
            time: formatTimeLeft(data.nextRotationAt),
          })}
        </p>
      </header>

      {purchaseResult ? (
        <section
          className={economyStyles.purchaseResult}
          data-emporium-purchase-result={purchaseResult.itemId}
          aria-live="polite"
        >
          <div className={economyStyles.purchaseResultTop}>
            <GuildRewardArt
              kind={purchaseResult.reward.kind}
              rewardKey={purchaseResult.reward.key}
              consumableKey={purchaseResult.reward.consumableKey}
              size={26}
            />
            <div className={economyStyles.purchaseResultText}>
              <span className={economyStyles.purchaseResultTitle}>
                {t("guild.emporium.purchased")}
              </span>
              <span className={economyStyles.purchaseResultItem}>
                {getRewardLabel(purchaseResult.reward, t)}
              </span>
            </div>
            <span
              className={economyStyles.purchaseResultBalance}
              data-purchase-balance={purchaseResult.sealsBalance}
            >
              <GuildIcon name="seal" size={14} />
              {t("guild.seals.amount", {
                count: purchaseResult.sealsBalance,
              })}
            </span>
          </div>

          {purchaseResult.chestResult ? (
            <GuildChestResult result={purchaseResult.chestResult} compact />
          ) : null}
        </section>
      ) : null}

      {isEmpty ? (
        <p className={cn(styles.bodyText, economyStyles.empty)}>
          {t("guild.emporium.empty")}
        </p>
      ) : (
        <>
          {renderShelf(
            t("guild.emporium.rotating"),
            data.rotatingItems,
            "rotating",
          )}
          {renderShelf(
            t("guild.emporium.permanent"),
            data.permanentItems,
            "permanent",
          )}
        </>
      )}

      <Modal
        opened={confirmListing !== null}
        onClose={() => setConfirmListing(null)}
        title={t("guild.emporium.confirmTitle")}
        centered
      >
        {confirmListing ? (
          <div
            className={economyStyles.confirm}
            data-emporium-confirm={confirmListing.id}
          >
            <div className={economyStyles.confirmItem}>
              <div className={economyStyles.confirmItemArt}>
                <GuildRewardArt
                  kind={confirmListing.reward.kind}
                  rewardKey={confirmListing.reward.key}
                  consumableKey={confirmListing.reward.consumableKey}
                  size={36}
                />
              </div>
              <div className={economyStyles.confirmItemBody}>
                <span className={economyStyles.confirmItemName}>
                  {getRewardLabel(confirmListing.reward, t)}
                </span>
                <span className={economyStyles.itemTags}>
                  <span className={economyStyles.kindTag}>
                    {getKindLabel(confirmListing.reward, t)}
                  </span>
                  <span
                    className={cn(
                      economyStyles.rarityTag,
                      getRarityClass(confirmListing.reward.rarity),
                    )}
                    data-rarity={confirmListing.reward.rarity}
                  >
                    {getRarityLabel(confirmListing.reward.rarity, t)}
                  </span>
                </span>
              </div>
            </div>

            <p className={cn(styles.bodyText, economyStyles.confirmText)}>
              {t("guild.emporium.confirmBody")}
            </p>

            <p
              className={economyStyles.confirmPrice}
              data-confirm-price={confirmListing.priceSeals}
            >
              <GuildIcon name="seal" size={16} />
              <span>
                {t("guild.seals.amount", {
                  count: confirmListing.priceSeals,
                })}
              </span>
            </p>

            <p
              className={economyStyles.confirmBalance}
              data-confirm-remaining={remaining}
            >
              <span>{t("guild.emporium.balance")}</span>
              <span className={economyStyles.confirmBalanceValue}>
                <GuildIcon name="seal" size={14} />
                {t("guild.seals.amount", { count: remaining })}
              </span>
            </p>

            <div className={economyStyles.confirmActions}>
              <PixelButton
                size="sm"
                variant="ghost-dark"
                onClick={() => setConfirmListing(null)}
                disabled={purchase.isPending}
              >
                {t("guild.emporium.cancel")}
              </PixelButton>
              <PixelButton
                size="sm"
                onClick={confirmPurchase}
                disabled={purchase.isPending}
              >
                {t("guild.emporium.confirm")}
              </PixelButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
