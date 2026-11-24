import { Skeleton } from "@mantine/core";
import { GuildRewardDescriptorDto } from "@repo/wrapper/server";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util";

import styles from "../guild.module.css";
import { useGuildRewards, useUpdateGuildCosmetics } from "../hooks";
import type { GuildAssetName } from "../scene/assets";
import { GuildIcon } from "../scene/GuildIcon";
import { PixelButton } from "../scene/PixelButton";
import { getRewardLabel } from "../util";

export interface GuildRewardsPanelProps {
  className?: string;
}

const KIND_ICONS: Record<string, GuildAssetName> = {
  badge: "trophy",
  title: "book",
  avatar_frame: "shield",
  weekly_chest: "chest",
};

const SECTIONS = [
  {
    kind: GuildRewardDescriptorDto.kind.BADGE,
    titleKey: "guild.rewardsPanel.sections.badges",
  },
  {
    kind: GuildRewardDescriptorDto.kind.TITLE,
    titleKey: "guild.rewardsPanel.sections.titles",
  },
  {
    kind: GuildRewardDescriptorDto.kind.AVATAR_FRAME,
    titleKey: "guild.rewardsPanel.sections.frames",
  },
] as const;

/**
 * Unlocked Guild cosmetics (design D6): badges are read-only, titles and
 * frames equip/unequip through `PATCH /v1/guild/cosmetics`. Nothing is patched
 * optimistically, so a `guild_cosmetic_not_owned` keeps the previous
 * selection while the mutation hook shows its translated message.
 */
export function GuildRewardsPanel({ className }: GuildRewardsPanelProps) {
  const { t } = useTranslation();
  const rewardsQuery = useGuildRewards();
  const updateCosmetics = useUpdateGuildCosmetics();
  const rewards = rewardsQuery.data?.unlockedRewards ?? [];
  const equippedTitleKey = rewardsQuery.data?.equippedTitleKey ?? null;
  const equippedFrameKey = rewardsQuery.data?.equippedFrameKey ?? null;

  const toggleCosmetic = (
    kind: GuildRewardDescriptorDto.kind,
    key: string,
    equipped: boolean,
  ) => {
    if (kind === GuildRewardDescriptorDto.kind.TITLE) {
      updateCosmetics.mutate({ guildTitleKey: equipped ? null : key });
      return;
    }

    if (kind === GuildRewardDescriptorDto.kind.AVATAR_FRAME) {
      updateCosmetics.mutate({ guildFrameKey: equipped ? null : key });
    }
  };

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
        SECTIONS.map((section) => {
          const items = rewards.filter(
            (item) => item.reward.kind === section.kind,
          );
          if (items.length === 0) return null;

          const equippedKey =
            section.kind === GuildRewardDescriptorDto.kind.TITLE
              ? equippedTitleKey
              : section.kind === GuildRewardDescriptorDto.kind.AVATAR_FRAME
                ? equippedFrameKey
                : null;
          const isEquippable =
            section.kind !== GuildRewardDescriptorDto.kind.BADGE;

          return (
            <div key={section.kind} className={styles.rewardsSection}>
              <h3
                className={cn(styles.captionMedium, styles.rewardsSectionTitle)}
              >
                {t(section.titleKey)}
              </h3>
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
                      className={styles.rewardRow}
                      data-reward-key={item.reward.key}
                      data-kind={section.kind}
                    >
                      <span className={styles.rewardLabel}>
                        <GuildIcon
                          name={KIND_ICONS[section.kind as string] ?? "star"}
                          size={20}
                        />
                        <span className={styles.rewardName}>{label}</span>
                        {isEquipped ? (
                          <span className={styles.rewardEquipped}>
                            {t("guild.rewardsPanel.equipped")}
                          </span>
                        ) : null}
                      </span>

                      {isEquippable ? (
                        <PixelButton
                          size="sm"
                          variant="ghost-dark"
                          aria-label={`${t(actionKey)}: ${label}`}
                          disabled={updateCosmetics.isPending}
                          onClick={() =>
                            toggleCosmetic(
                              section.kind,
                              item.reward.key,
                              isEquipped,
                            )
                          }
                        >
                          {t(actionKey)}
                        </PixelButton>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })
      )}
    </section>
  );
}
