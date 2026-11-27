import { type ReactNode, useState } from "react";
import { Skeleton } from "@mantine/core";
import type { TFunction } from "i18next";
import type {
  GuildExtraSlotPermitStatusDto,
  UserGuildRewardDto,
} from "@repo/wrapper/server";
import {
  GuildRewardDescriptorDto,
  type UpdateGuildCosmeticsDto,
} from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { cn, Modal } from "#@/util";

import styles from "../guild.module.css";
import progressionStyles from "./GuildProgression.module.css";
import { useActivateGuildExtraSlotPermit } from "../hooks/useActivateGuildExtraSlotPermit";
import { useGuildRewards } from "../hooks/useGuildRewards";
import { useUpdateGuildCosmetics } from "../hooks/useUpdateGuildCosmetics";
import { getConsumableAsset, getRarityClass } from "../scene/cosmeticAssets";
import { GuildIcon } from "../scene/GuildIcon";
import { GuildRewardArt } from "../scene/GuildRewardArt";
import { PixelButton } from "../scene/PixelButton";
import { getRewardLabel } from "../util/getRewardLabel";

export interface GuildRewardsPanelProps {
  className?: string;
}

/** D8: decor is multi-select up to 4, the showcase up to 3 badges. */
const DECOR_MAX = 4;
const SHOWCASE_MAX = 3;

const CONSUMABLE_KEYS = [
  "hourglass",
  "reroll_charter",
  "extra_slot_permit",
] as const;

type SingleCosmeticField =
  | "guildTitleKey"
  | "guildFrameKey"
  | "equippedLicenseThemeKey"
  | "equippedStampStyleKey";

interface SingleSection {
  kind: GuildRewardDescriptorDto.kind;
  titleKey: string;
  field: SingleCosmeticField;
}

const SINGLE_SECTIONS: SingleSection[] = [
  {
    kind: GuildRewardDescriptorDto.kind.TITLE,
    titleKey: "guild.rewardsPanel.sections.titles",
    field: "guildTitleKey",
  },
  {
    kind: GuildRewardDescriptorDto.kind.AVATAR_FRAME,
    titleKey: "guild.rewardsPanel.sections.frames",
    field: "guildFrameKey",
  },
  {
    kind: GuildRewardDescriptorDto.kind.LICENSE_THEME,
    titleKey: "guild.rewardsPanel.sections.licenseThemes",
    field: "equippedLicenseThemeKey",
  },
  {
    kind: GuildRewardDescriptorDto.kind.STAMP_STYLE,
    titleKey: "guild.rewardsPanel.sections.stampStyles",
    field: "equippedStampStyleKey",
  },
];

function formatDate(value: string, locale: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

/** Dynamic keys (reward kinds, rarity, section copy) bypass the typed key union. */
function translate(t: TFunction, key: string): string {
  return (t as unknown as (value: string) => string)(key);
}

function RarityTag({ rarity }: { rarity?: string | null }) {
  const { t } = useTranslation();

  if (!rarity) return null;

  return (
    <span
      className={cn(progressionStyles.rarityTag, getRarityClass(rarity))}
      data-rarity={rarity}
    >
      {translate(t, `guild.rarity.${rarity}`)}
    </span>
  );
}

interface RewardVisualProps {
  item: UserGuildRewardDto;
  kind: GuildRewardDescriptorDto.kind;
}

function RewardVisual({ item, kind }: RewardVisualProps) {
  return (
    <GuildRewardArt
      kind={kind}
      rewardKey={item.reward.key}
      consumableKey={item.reward.consumableKey}
      size={kind === GuildRewardDescriptorDto.kind.TAVERN_DECOR ? 22 : 20}
    />
  );
}

interface RewardTextProps {
  label: string;
  rarity?: string | null;
  equipped: boolean;
}

/**
 * Two-line reward row text: the name on its own line (it may wrap, so decor
 * names never truncate) and the rarity and Equipped chips below it.
 */
function RewardText({ label, rarity, equipped }: RewardTextProps) {
  const { t } = useTranslation();

  return (
    <span className={styles.rewardText}>
      <span className={styles.rewardName}>{label}</span>
      {rarity || equipped ? (
        <span className={styles.rewardMeta}>
          <RarityTag rarity={rarity} />
          {equipped ? (
            <span className={styles.rewardEquipped}>
              {t("guild.rewardsPanel.equipped")}
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

interface RewardsSectionDisclosureProps {
  /** Stable hook for tests: `title`, `license_theme`, `tavern_decor`, ... */
  id: string;
  title: string;
  /** Number of owned rewards in this section, shown next to the title. */
  ownedCount?: number;
  /** Right-aligned equipped item name or section limit hint. */
  trailing?: ReactNode;
  /** Decor and Consumables start open: they hold the direct actions. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * One collapsible Rewards section (round-2 polish). A native
 * `<details>/<summary>` keeps the disclosure keyboard and screen-reader
 * accessible, and the summary keeps the section name, the owned count and the
 * equipped item (or the section limit) visible while the rows are collapsed.
 */
function RewardsSectionDisclosure({
  id,
  title,
  ownedCount,
  trailing,
  defaultOpen = false,
  children,
}: RewardsSectionDisclosureProps) {
  return (
    <details
      className={progressionStyles.rewardsSection}
      data-rewards-section={id}
      open={defaultOpen || undefined}
    >
      <summary className={progressionStyles.rewardsSummary}>
        <span className={progressionStyles.rewardsSummaryRow}>
          <span
            className={cn(styles.captionMedium, styles.rewardsSectionTitle)}
          >
            {title}
          </span>
          {ownedCount !== undefined ? (
            <span
              className={progressionStyles.rewardsSummaryCount}
              data-rewards-count={ownedCount}
            >
              {ownedCount}
            </span>
          ) : null}
          {trailing ? (
            <span className={progressionStyles.rewardsSummaryTrailing}>
              {trailing}
            </span>
          ) : null}
        </span>
      </summary>
      {children}
    </details>
  );
}

/**
 * Unlocked Guild cosmetics (design D6 + D8). Titles, frames, License themes and
 * stamp styles are single-select (`null` clears); tavern decor is up to 4 with
 * order preserved and the Trophy Showcase up to 3 badges. Every change sends
 * only its own field. Nothing is patched optimistically, so a
 * `guild_cosmetic_not_owned`/`guild_cosmetic_limit_exceeded` keeps the previous
 * selection while the mutation hook shows its translated message.
 *
 * The Consumables section lists the Hourglass, Reroll Charter and Extra Slot
 * Permit counts; activating the permit asks for confirmation, then shows the
 * active-until date and the remaining count.
 */
export function GuildRewardsPanel({ className }: GuildRewardsPanelProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const rewardsQuery = useGuildRewards();
  const updateCosmetics = useUpdateGuildCosmetics();
  const activatePermit = useActivateGuildExtraSlotPermit();
  const [permitConfirmOpen, setPermitConfirmOpen] = useState(false);
  const [permitStatus, setPermitStatus] =
    useState<GuildExtraSlotPermitStatusDto | null>(null);

  const data = rewardsQuery.data;
  const rewards = data?.unlockedRewards ?? [];
  const equippedDecorKeys = data?.equippedDecorKeys ?? [];
  const showcaseBadgeIds = data?.showcaseBadgeIds ?? [];
  const consumables = data?.consumables;
  const permitCount =
    permitStatus?.remainingPermits ?? consumables?.extra_slot_permit ?? 0;
  const isMutating = updateCosmetics.isPending;

  const equippedKeyFor = (field: SingleCosmeticField): string | null => {
    if (field === "guildTitleKey") return data?.equippedTitleKey ?? null;
    if (field === "guildFrameKey") return data?.equippedFrameKey ?? null;
    if (field === "equippedLicenseThemeKey") {
      return data?.equippedLicenseThemeKey ?? null;
    }
    return data?.equippedStampStyleKey ?? null;
  };

  const patchSingle = (
    field: SingleCosmeticField,
    key: string,
    isEquipped: boolean,
  ) => {
    const dto: UpdateGuildCosmeticsDto = {};
    dto[field] = isEquipped ? null : key;
    updateCosmetics.mutate(dto);
  };

  const toggleDecor = (key: string) => {
    const next = equippedDecorKeys.includes(key)
      ? equippedDecorKeys.filter((item) => item !== key)
      : [...equippedDecorKeys, key];

    updateCosmetics.mutate({ equippedDecorKeys: next });
  };

  const toggleShowcase = (badgeId: string) => {
    const next = showcaseBadgeIds.includes(badgeId)
      ? showcaseBadgeIds.filter((item) => item !== badgeId)
      : [...showcaseBadgeIds, badgeId];

    updateCosmetics.mutate({ showcaseBadgeIds: next });
  };

  const handleActivatePermit = () => {
    activatePermit.mutate(undefined, {
      onSuccess: (status) => {
        setPermitStatus(status);
        setPermitConfirmOpen(false);
      },
    });
  };

  const renderSingleSection = (section: SingleSection) => {
    const items = rewards.filter((item) => item.reward.kind === section.kind);
    if (items.length === 0) return null;

    const equippedKey = equippedKeyFor(section.field);
    const equippedItem = equippedKey
      ? items.find((item) => item.reward.key === equippedKey)
      : undefined;

    return (
      <RewardsSectionDisclosure
        key={section.kind}
        id={section.kind}
        title={translate(t, section.titleKey)}
        ownedCount={items.length}
        trailing={
          equippedItem ? (
            <span
              className={progressionStyles.rewardsSummaryEquipped}
              data-equipped-label={equippedItem.reward.key}
            >
              {getRewardLabel(equippedItem.reward, t)}
            </span>
          ) : undefined
        }
      >
        <ul className={styles.rewardsList}>
          {items.map((item) => {
            const label = getRewardLabel(item.reward, t);
            const isEquipped = equippedKey === item.reward.key;
            const actionKey = isEquipped
              ? "guild.rewardsPanel.unequip"
              : "guild.rewardsPanel.equip";

            return (
              <li
                key={item.id}
                className={cn(
                  styles.rewardRow,
                  getRarityClass(item.reward.rarity),
                )}
                data-reward-key={item.reward.key}
                data-kind={section.kind}
                data-equipped={String(isEquipped)}
              >
                <span className={styles.rewardLabel}>
                  <RewardVisual item={item} kind={section.kind} />
                  <RewardText
                    label={label}
                    rarity={item.reward.rarity}
                    equipped={isEquipped}
                  />
                </span>

                <PixelButton
                  size="sm"
                  variant="ghost-dark"
                  aria-label={`${t(actionKey)}: ${label}`}
                  disabled={isMutating}
                  onClick={() =>
                    patchSingle(section.field, item.reward.key, isEquipped)
                  }
                >
                  {t(actionKey)}
                </PixelButton>
              </li>
            );
          })}
        </ul>
      </RewardsSectionDisclosure>
    );
  };

  const decorItems = rewards.filter(
    (item) => item.reward.kind === GuildRewardDescriptorDto.kind.TAVERN_DECOR,
  );
  const showcaseItems = rewards.filter(
    (item) =>
      item.reward.kind === GuildRewardDescriptorDto.kind.BADGE &&
      item.reward.achievementId,
  );
  const decorFull = equippedDecorKeys.length >= DECOR_MAX;
  const showcaseFull = showcaseBadgeIds.length >= SHOWCASE_MAX;

  return (
    <section className={cn(styles.rewardsPanel, className)}>
      <header className={styles.rewardsPanelHeader}>
        <span className={cn(styles.pixelOverline, styles.rewardsPanelTitle)}>
          {t("guild.rewardsPanel.title")}
        </span>
        <span className={styles.rewardsPanelLine} aria-hidden />
      </header>

      {rewardsQuery.isPending ? (
        <Skeleton height={76} radius={8} />
      ) : rewards.length === 0 ? (
        <p className={cn(styles.bodyText, styles.rewardsEmpty)}>
          {t("guild.rewardsPanel.empty")}
        </p>
      ) : (
        <>
          {SINGLE_SECTIONS.map(renderSingleSection)}

          {decorItems.length > 0 ? (
            <RewardsSectionDisclosure
              id={GuildRewardDescriptorDto.kind.TAVERN_DECOR}
              title={t("guild.rewardsPanel.sections.decor")}
              ownedCount={decorItems.length}
              defaultOpen
              trailing={
                <span className={progressionStyles.rewardsSummaryHint}>
                  {t("guild.rewardsPanel.decorLimit")}
                </span>
              }
            >
              <ul className={styles.rewardsList}>
                {decorItems.map((item) => {
                  const label = getRewardLabel(item.reward, t);
                  const isEquipped = equippedDecorKeys.includes(
                    item.reward.key,
                  );
                  const actionKey = isEquipped
                    ? "guild.rewardsPanel.remove"
                    : "guild.rewardsPanel.add";

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        styles.rewardRow,
                        getRarityClass(item.reward.rarity),
                      )}
                      data-reward-key={item.reward.key}
                      data-kind={item.reward.kind}
                      data-equipped={String(isEquipped)}
                    >
                      <span className={styles.rewardLabel}>
                        <RewardVisual
                          item={item}
                          kind={GuildRewardDescriptorDto.kind.TAVERN_DECOR}
                        />
                        <RewardText
                          label={label}
                          rarity={item.reward.rarity}
                          equipped={isEquipped}
                        />
                      </span>
                      <PixelButton
                        size="sm"
                        variant="ghost-dark"
                        aria-label={`${t(actionKey)}: ${label}`}
                        disabled={isMutating || (!isEquipped && decorFull)}
                        onClick={() => toggleDecor(item.reward.key)}
                      >
                        {t(actionKey)}
                      </PixelButton>
                    </li>
                  );
                })}
              </ul>
            </RewardsSectionDisclosure>
          ) : null}

          {showcaseItems.length > 0 ? (
            <RewardsSectionDisclosure
              id="showcase"
              title={t("guild.rewardsPanel.sections.showcase")}
              ownedCount={showcaseItems.length}
              trailing={
                <span className={progressionStyles.rewardsSummaryHint}>
                  {t("guild.rewardsPanel.showcaseLimit")}
                </span>
              }
            >
              <ul className={styles.rewardsList}>
                {showcaseItems.map((item) => {
                  const label = getRewardLabel(item.reward, t);
                  const badgeId = item.reward.achievementId as string;
                  const isEquipped = showcaseBadgeIds.includes(badgeId);
                  const actionKey = isEquipped
                    ? "guild.rewardsPanel.remove"
                    : "guild.rewardsPanel.add";

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        styles.rewardRow,
                        getRarityClass(item.reward.rarity),
                      )}
                      data-reward-key={item.reward.key}
                      data-kind={item.reward.kind}
                      data-equipped={String(isEquipped)}
                    >
                      <span className={styles.rewardLabel}>
                        <GuildIcon name="trophy" size={20} />
                        <RewardText
                          label={label}
                          rarity={item.reward.rarity}
                          equipped={isEquipped}
                        />
                      </span>
                      <PixelButton
                        size="sm"
                        variant="ghost-dark"
                        aria-label={`${t(actionKey)}: ${label}`}
                        disabled={isMutating || (!isEquipped && showcaseFull)}
                        onClick={() => toggleShowcase(badgeId)}
                      >
                        {t(actionKey)}
                      </PixelButton>
                    </li>
                  );
                })}
              </ul>
            </RewardsSectionDisclosure>
          ) : null}

          <RewardsSectionDisclosure
            id={GuildRewardDescriptorDto.kind.CONSUMABLE}
            title={t("guild.rewardsPanel.sections.consumables")}
            ownedCount={
              (consumables?.hourglass ?? 0) +
              (consumables?.reroll_charter ?? 0) +
              permitCount
            }
            defaultOpen
          >
            <ul className={styles.rewardsList}>
              {CONSUMABLE_KEYS.map((key) => (
                <li
                  key={key}
                  className={styles.rewardRow}
                  data-consumable={key}
                >
                  <span className={styles.rewardLabel}>
                    <GuildIcon name={getConsumableAsset(key)} size={20} />
                    <span
                      className={cn(
                        styles.rewardName,
                        progressionStyles.consumableBlock,
                      )}
                    >
                      <span className={progressionStyles.consumableName}>
                        {translate(t, `guild.consumables.${key}.name`)}
                      </span>
                      <span className={progressionStyles.consumableEffect}>
                        {translate(t, `guild.consumables.${key}.effect`)}
                      </span>
                      {key === "extra_slot_permit" &&
                      permitStatus?.expiresAt ? (
                        <span
                          className={progressionStyles.permitActive}
                          data-permit-active="true"
                        >
                          {t("guild.consumables.activeUntil", {
                            date: formatDate(permitStatus.expiresAt, language),
                          })}
                        </span>
                      ) : null}
                    </span>
                    <span
                      className={progressionStyles.consumableCount}
                      data-consumable-count={key}
                      aria-label={`${translate(
                        t,
                        `guild.consumables.${key}.name`,
                      )}: ${
                        key === "extra_slot_permit"
                          ? permitCount
                          : (consumables?.[key] ?? 0)
                      }`}
                    >
                      {key === "extra_slot_permit"
                        ? permitCount
                        : (consumables?.[key] ?? 0)}
                    </span>
                    {key === "extra_slot_permit" ? (
                      <PixelButton
                        size="sm"
                        variant="ghost-dark"
                        disabled={permitCount <= 0 || activatePermit.isPending}
                        onClick={() => setPermitConfirmOpen(true)}
                      >
                        {t("guild.consumables.activate")}
                      </PixelButton>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
            <p className={progressionStyles.consumableNote}>
              {t("guild.consumables.freeHourglass")}
            </p>
          </RewardsSectionDisclosure>
        </>
      )}

      <Modal
        opened={permitConfirmOpen}
        onClose={() => setPermitConfirmOpen(false)}
        title={t("guild.consumables.activate")}
        centered
      >
        <div className={progressionStyles.permitModal}>
          <p className={cn(styles.bodyText, progressionStyles.permitModalText)}>
            {t("guild.consumables.extra_slot_permit.effect")}
          </p>
          <div className={progressionStyles.permitModalActions}>
            <PixelButton
              size="sm"
              variant="ghost-dark"
              onClick={() => setPermitConfirmOpen(false)}
            >
              {t("actions.cancel")}
            </PixelButton>
            <PixelButton
              size="sm"
              onClick={handleActivatePermit}
              disabled={activatePermit.isPending}
            >
              {t("guild.consumables.activate")}
            </PixelButton>
          </div>
        </div>
      </Modal>
    </section>
  );
}
