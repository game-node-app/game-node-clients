import type {
  ProfileResponseDto,
  SupporterPreferencesResponseDto,
} from "@repo/wrapper/server";
import {
  ACCENT_SURFACE,
  getOnAccentText,
  getReadableAccent,
  hexToRgba,
  normalizeAccentHex,
} from "./accentColor";
import { isSupporterTitleKey, type SupporterTitleKey } from "./supporterTitles";

export const DEFAULT_SUPPORTER_ACCENT = "#9747FF";

/**
 * The defaults the server applies for a supporter. Also used to render the
 * example preview for users without preferences (design D7/D9).
 */
export const DEFAULT_SUPPORTER_PREFERENCES: SupporterPreferencesResponseDto = {
  showBadge: true,
  titleKey: null,
  showAnimatedAvatarBorder: true,
  showSupporterTheme: true,
  accentColor: null,
  showOnSupportersWall: true,
  showLiveProfile: false,
};

export interface ActiveSupporterPerks {
  badge: boolean;
  /** null when the stored key is not in the client catalog. */
  titleKey: SupporterTitleKey | null;
  border: boolean;
  theme: boolean;
  liveProfile: boolean;
  /** Stored or default accent, `#RRGGBB`. */
  accent: string;
  /** Readable on {@link ACCENT_SURFACE} (>= 4.5:1). */
  accentText: string;
  /** Readable on {@link ACCENT_SURFACE} (>= 3:1). */
  accentDecor: string;
  /** `rgba(accent, 0.14)` for tinted panels. */
  accentSoft: string;
  /** `rgba(accent, 0.45)` for pill borders. */
  accentBorder: string;
  /** `#FFFFFF` or `#141414`, text drawn on the accent. */
  onAccent: string;
}

/**
 * Derives every renderable perk from a profile read. Returns null unless
 * `supporterPreferences` is an object: lapsed users, failed lookups and servers
 * without the new fields render no perk (design D2).
 */
export function getActiveSupporterPerks(
  profile:
    | Pick<ProfileResponseDto, "isSupporter" | "supporterPreferences">
    | null
    | undefined,
): ActiveSupporterPerks | null {
  const preferences = profile?.supporterPreferences;

  if (!preferences || typeof preferences !== "object") return null;

  const accent =
    normalizeAccentHex(preferences.accentColor) ?? DEFAULT_SUPPORTER_ACCENT;

  return {
    badge: !!preferences.showBadge,
    titleKey: isSupporterTitleKey(preferences.titleKey)
      ? preferences.titleKey
      : null,
    border: !!preferences.showAnimatedAvatarBorder,
    theme: !!preferences.showSupporterTheme,
    liveProfile: !!preferences.showLiveProfile,
    accent,
    accentText: getReadableAccent(accent, ACCENT_SURFACE, 4.5),
    accentDecor: getReadableAccent(accent, ACCENT_SURFACE, 3),
    accentSoft: hexToRgba(accent, 0.14),
    accentBorder: hexToRgba(accent, 0.45),
    onAccent: getOnAccentText(accent),
  };
}
