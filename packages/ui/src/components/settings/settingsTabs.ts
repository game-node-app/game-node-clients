import {
  IconBell,
  IconBooks,
  IconHeart,
  IconPalette,
  IconPlug,
  IconProps,
  IconShield,
  IconSparkles,
  IconUser,
} from "@tabler/icons-react";
import { ComponentType } from "react";

export const SETTINGS_TABS = [
  "premium",
  "profile",
  "connections",
  "library",
  "notifications",
  "privacy",
  "appearance",
  "mcp",
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number];

/** Anchors inside the privacy tab, listed under its sidebar item. */
export const SETTINGS_PRIVACY_SECTIONS = [
  "privacy",
  "interactions",
  "blocked",
  "sessions",
  "danger",
] as const;

export type SettingsPrivacySection = (typeof SETTINGS_PRIVACY_SECTIONS)[number];

export interface SettingsTabConfig {
  tab: SettingsTab;
  Icon: ComponentType<IconProps>;
  isNew?: boolean;
  /** Premium is drawn with its own violet highlight. */
  highlight?: boolean;
  sections?: readonly SettingsPrivacySection[];
}

export const SETTINGS_TAB_CONFIGS: SettingsTabConfig[] = [
  { tab: "premium", Icon: IconHeart, highlight: true },
  { tab: "profile", Icon: IconUser, isNew: true },
  { tab: "connections", Icon: IconPlug },
  { tab: "library", Icon: IconBooks },
  { tab: "notifications", Icon: IconBell },
  { tab: "privacy", Icon: IconShield, sections: SETTINGS_PRIVACY_SECTIONS },
  { tab: "appearance", Icon: IconPalette },
  { tab: "mcp", Icon: IconSparkles, isNew: true },
];

export const SETTINGS_DEFAULT_TAB: SettingsTab = "profile";

export function isSettingsTab(value: unknown): value is SettingsTab {
  return (
    typeof value === "string" &&
    (SETTINGS_TABS as readonly string[]).includes(value)
  );
}

/** DOM id of a section inside the settings panel, used for anchors and scroll-spy. */
export function getSettingsSectionId(section: string) {
  return `settings-section-${section}`;
}
