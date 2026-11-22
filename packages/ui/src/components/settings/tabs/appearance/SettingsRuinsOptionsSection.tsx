import { SegmentedControl, Switch } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import {
  type RuinsBootAnimation,
  useRuinsPreferences,
} from "#@/theme/ruins/preferences";

const BOOT_ANIMATION_VALUES = [
  "always",
  "daily",
  "never",
] as const satisfies readonly RuinsBootAnimation[];

/**
 * Per-device options of the Ruins theme (boot terminal, paper texture and
 * scanline). The parent renders it only while Ruins is the active theme.
 */
export function SettingsRuinsOptionsSection() {
  const { t } = useTranslation();
  const {
    bootAnimation,
    paperTexture,
    scanline,
    setBootAnimation,
    setPaperTexture,
    setScanline,
  } = useRuinsPreferences();

  return (
    <SettingsSection
      sectionId={"ruins"}
      title={t("settings.appearance.ruins.title")}
      description={t("settings.appearance.ruins.description")}
    >
      <SettingsCard>
        <SettingsRow
          title={t("settings.appearance.ruins.bootAnimation.title")}
          description={t("settings.appearance.ruins.bootAnimation.description")}
          stackRightSection
          rightSection={
            <SegmentedControl
              value={bootAnimation}
              onChange={(value) =>
                setBootAnimation(value as RuinsBootAnimation)
              }
              aria-label={t("settings.appearance.ruins.bootAnimation.title")}
              data={BOOT_ANIMATION_VALUES.map((value) => ({
                value,
                label: t(`settings.appearance.ruins.bootAnimation.${value}`),
              }))}
              radius={8}
              classNames={{
                root: "gap-0.5 border border-solid border-line bg-nav-canvas p-[3px]",
                indicator: "rounded-md bg-nav-raised shadow-none",
                label: "px-3 py-[5px] text-[13px] font-medium",
              }}
            />
          }
        />
        <SettingsRow
          title={t("settings.appearance.ruins.paperTexture.title")}
          description={t("settings.appearance.ruins.paperTexture.description")}
          rightSection={
            <Switch
              size={"xs"}
              checked={paperTexture}
              onChange={(event) => setPaperTexture(event.currentTarget.checked)}
              aria-label={t("settings.appearance.ruins.paperTexture.title")}
            />
          }
        />
        <SettingsRow
          title={t("settings.appearance.ruins.scanline.title")}
          description={t("settings.appearance.ruins.scanline.description")}
          rightSection={
            <Switch
              size={"xs"}
              checked={scanline}
              onChange={(event) => setScanline(event.currentTarget.checked)}
              aria-label={t("settings.appearance.ruins.scanline.title")}
            />
          }
        />
      </SettingsCard>
    </SettingsSection>
  );
}
