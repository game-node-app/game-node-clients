// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import type {
  ProfileResponseDto,
  SupporterPreferencesResponseDto,
} from "../../../../../packages/wrapper/src/server";
import {
  DEFAULT_SUPPORTER_ACCENT,
  DEFAULT_SUPPORTER_PREFERENCES,
  getActiveSupporterPerks,
} from "../../../../../packages/ui/src/components/supporter/perks/supporterPerks";
import {
  isSupporterTitleKey,
  SUPPORTER_TITLE_KEY_PATTERN,
  SUPPORTER_TITLE_KEYS,
} from "../../../../../packages/ui/src/components/supporter/perks/supporterTitles";

function profileWith(
  preferences: Partial<SupporterPreferencesResponseDto> | null = {},
): Pick<ProfileResponseDto, "isSupporter" | "supporterPreferences"> {
  return {
    isSupporter: true,
    supporterPreferences:
      preferences === null
        ? null
        : { ...DEFAULT_SUPPORTER_PREFERENCES, ...preferences },
  };
}

describe("getActiveSupporterPerks", () => {
  it("returns null when preferences are null", () => {
    expect(getActiveSupporterPerks(profileWith(null))).toBeNull();
  });

  it("returns null when the profile or its fields are missing", () => {
    expect(getActiveSupporterPerks(undefined)).toBeNull();
    expect(getActiveSupporterPerks(null)).toBeNull();
    expect(getActiveSupporterPerks({ isSupporter: true } as never)).toBeNull();
    expect(
      getActiveSupporterPerks({
        isSupporter: false,
        supporterPreferences: undefined,
      } as never),
    ).toBeNull();
  });

  it("derives the default perks from default preferences", () => {
    const perks = getActiveSupporterPerks(profileWith());

    expect(perks).not.toBeNull();
    expect(perks!.badge).toBe(true);
    expect(perks!.border).toBe(true);
    expect(perks!.theme).toBe(true);
    expect(perks!.liveProfile).toBe(false);
    expect(perks!.titleKey).toBeNull();
    expect(perks!.accent).toBe(DEFAULT_SUPPORTER_ACCENT);
    expect(perks!.accentText).toBe("#A159FF");
    expect(perks!.accentDecor).toBe(DEFAULT_SUPPORTER_ACCENT);
    expect(perks!.accentSoft).toBe("rgba(151, 71, 255, 0.14)");
    expect(perks!.accentBorder).toBe("rgba(151, 71, 255, 0.45)");
    expect(perks!.onAccent).toBe("#FFFFFF");
  });

  it("follows stored preferences", () => {
    const perks = getActiveSupporterPerks(
      profileWith({
        showBadge: false,
        showAnimatedAvatarBorder: false,
        showSupporterTheme: false,
        showLiveProfile: true,
        accentColor: "#FF8800",
        titleKey: "patron",
      }),
    );

    expect(perks!.badge).toBe(false);
    expect(perks!.border).toBe(false);
    expect(perks!.theme).toBe(false);
    expect(perks!.liveProfile).toBe(true);
    expect(perks!.accent).toBe("#FF8800");
    expect(perks!.titleKey).toBe("patron");
  });

  it("drops a titleKey that is not in the client catalog", () => {
    const perks = getActiveSupporterPerks(profileWith({ titleKey: "wizard" }));

    expect(perks!.titleKey).toBeNull();
  });

  it("normalizes the stored accent and falls back for invalid values", () => {
    expect(
      getActiveSupporterPerks(profileWith({ accentColor: "#ff8800" }))!.accent,
    ).toBe("#FF8800");
    expect(
      getActiveSupporterPerks(profileWith({ accentColor: "orange" }))!.accent,
    ).toBe(DEFAULT_SUPPORTER_ACCENT);
  });
});

describe("supporter title catalog", () => {
  it("only has keys accepted by the server pattern", () => {
    for (const key of SUPPORTER_TITLE_KEYS) {
      expect(key).toMatch(SUPPORTER_TITLE_KEY_PATTERN);
      expect(key).toMatch(/^[a-z0-9_-]{1,32}$/);
    }
  });

  it("has no duplicate keys", () => {
    expect(new Set(SUPPORTER_TITLE_KEYS).size).toBe(
      SUPPORTER_TITLE_KEYS.length,
    );
  });

  it("guards unknown title keys", () => {
    expect(isSupporterTitleKey("night_owl")).toBe(true);
    expect(isSupporterTitleKey("wizard")).toBe(false);
    expect(isSupporterTitleKey(null)).toBe(false);
    expect(isSupporterTitleKey(42)).toBe(false);
  });
});
