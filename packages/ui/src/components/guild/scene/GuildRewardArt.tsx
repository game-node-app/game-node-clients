import type { CSSProperties } from "react";
import { cn } from "#@/util";

import artStyles from "./GuildRewardArt.module.css";
import { GuildIcon } from "./GuildIcon";
import {
  getChestAsset,
  getConsumableAsset,
  getDecorAsset,
  getFrameClass,
  getLicenseThemeClass,
  getStampStyleClass,
} from "./cosmeticAssets";

export interface GuildRewardArtProps {
  /** `GuildRewardDescriptorDto.kind` (`badge`, `title`, `tavern_decor`, ...). */
  kind: string;
  /** Reward key (`decor_oak_barrel`, `stamp_frost_seal`, ...). */
  rewardKey: string | null | undefined;
  /** Consumable key when the descriptor has one; falls back to `rewardKey`. */
  consumableKey?: string | null;
  /** Width in px. Defaults to 24. */
  size?: number;
  className?: string;
}

/*
 * Reward descriptor kinds (hand-off 8.7). Compared as strings so the scene does
 * not depend on the wrapper enums; unknown kinds degrade to the book glyph.
 */
const TAVERN_DECOR = "tavern_decor";
const CONSUMABLE = "consumable";
const STAMP_STYLE = "stamp_style";
const LICENSE_THEME = "license_theme";
const AVATAR_FRAME = "avatar_frame";
const BADGE = "badge";
const TITLE = "title";

const CHEST_KINDS = new Set([
  "weekly_chest",
  "chest_bronze",
  "chest_silver",
  "chest_gold",
  "chest_relic",
]);

/** Glyph a miniature stamp carries; any rank letter reads as a seal. */
const STAMP_GLYPH = "S";

function artSize(size: number): string {
  return `${Math.max(14, size)}px`;
}

/**
 * One artwork renderer for every Guild reward (correction V2–V5).
 *
 * Chests, consumables and tavern decor use their own SVGs. Stamp styles,
 * License themes and avatar frames reuse the equipped cosmetic classes so each
 * item shows its real colours: a miniature wax seal, a tiny ledger swatch and
 * the framed avatar silhouette. Badges and titles fall back to the trophy and
 * book glyphs, and an unknown kind shows the book instead of a hole.
 */
export function GuildRewardArt({
  kind,
  rewardKey,
  consumableKey,
  size = 24,
  className,
}: GuildRewardArtProps) {
  const key = rewardKey ?? "";

  if (kind === TAVERN_DECOR) {
    return (
      <GuildIcon name={getDecorAsset(key)} size={size} className={className} />
    );
  }

  if (CHEST_KINDS.has(kind)) {
    return (
      <GuildIcon name={getChestAsset(key)} size={size} className={className} />
    );
  }

  if (kind === CONSUMABLE) {
    return (
      <GuildIcon
        name={getConsumableAsset(consumableKey ?? key)}
        size={size}
        className={className}
      />
    );
  }

  const artStyle = {
    "--guild-reward-art-size": artSize(size),
  } as CSSProperties;

  if (kind === STAMP_STYLE) {
    return (
      <span
        className={cn(artStyles.stamp, getStampStyleClass(key), className)}
        style={artStyle}
        data-reward-art={STAMP_STYLE}
        data-reward-stamp-style={key || undefined}
        aria-hidden
      >
        <span className={artStyles.stampGlyph}>{STAMP_GLYPH}</span>
      </span>
    );
  }

  if (kind === LICENSE_THEME) {
    return (
      <span
        className={cn(artStyles.license, getLicenseThemeClass(key), className)}
        style={artStyle}
        data-reward-art={LICENSE_THEME}
        data-reward-license-theme={key || undefined}
        aria-hidden
      >
        <span className={artStyles.licenseLine} />
        <span
          className={cn(artStyles.licenseLine, artStyles.licenseLineShort)}
        />
      </span>
    );
  }

  if (kind === AVATAR_FRAME) {
    const frameClass = getFrameClass(key);

    return (
      <span
        className={cn(
          artStyles.frame,
          frameClass ?? artStyles.frameFallback,
          className,
        )}
        style={artStyle}
        data-reward-art={AVATAR_FRAME}
        data-reward-frame={key || undefined}
        aria-hidden
      >
        <GuildIcon
          name="silhouette"
          size={Math.max(8, Math.round(size * 0.44))}
        />
      </span>
    );
  }

  if (kind === BADGE) {
    return <GuildIcon name="trophy" size={size} className={className} />;
  }

  if (kind === TITLE) {
    return <GuildIcon name="book" size={size} className={className} />;
  }

  return <GuildIcon name="book" size={size} className={className} />;
}
