import { Box, Radio, Text } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { LANGUAGE_OPTIONS } from "#@/components/general/LanguagePickerMenu/LanguageSwitcherMenu";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import {
  SettingsComingSoonBadge,
  SettingsPill,
} from "#@/components/settings/common/SettingsPill";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import {
  SettingsRadioDot,
  SettingsThemeOptionCard,
  SettingsThemePalette,
} from "#@/components/settings/tabs/appearance/SettingsThemeOptionCard";

/** The only theme that exists today (apps force the dark color scheme). */
const CURRENT_THEME = "dark";

const BASE_THEMES: {
  value: "dark" | "light" | "system";
  palette: SettingsThemePalette;
}[] = [
  {
    value: "dark",
    palette: {
      background: "#0e0e0e",
      sidebar: "#1a1a1a",
      title: "#ffffff",
      text: "#7a7a7a",
      accent: "#f15025",
    },
  },
  {
    value: "light",
    palette: {
      background: "#f4f4f5",
      sidebar: "#e4e4e7",
      title: "#18181b",
      text: "#7a7a7a",
      accent: "#f15025",
    },
  },
  {
    value: "system",
    palette: {
      background: "#2a2a2a",
      sidebar: "#1a1a1a",
      title: "#ffffff",
      text: "#7a7a7a",
      accent: "#f15025",
    },
  },
];

/** Store-inspired palettes. Store names are proper nouns and are not translated. */
const SPECIAL_THEMES: {
  value: "steam" | "xbox" | "playstation" | "nintendo";
  name: string;
  palette: SettingsThemePalette;
}[] = [
  {
    value: "steam",
    name: "Steam",
    palette: {
      background: "#1b2838",
      sidebar: "#171a21",
      title: "#ffffff",
      text: "#8f98a0",
      accent: "#66c0f4",
    },
  },
  {
    value: "xbox",
    name: "Xbox",
    palette: {
      background: "#0e0e0e",
      sidebar: "#1f1f1f",
      title: "#ffffff",
      text: "#9a9a9a",
      accent: "#107c10",
    },
  },
  {
    value: "playstation",
    name: "PlayStation",
    palette: {
      background: "#001d4a",
      sidebar: "#00439c",
      title: "#ffffff",
      text: "#a9c4eb",
      accent: "#0070d1",
    },
  },
  {
    value: "nintendo",
    name: "Nintendo",
    palette: {
      background: "#ffffff",
      sidebar: "#e6e6e6",
      title: "#1a1a1a",
      text: "#8a8a8a",
      accent: "#e60012",
      bordered: true,
    },
  },
];

/**
 * Appearance and language tab. The language picker is functional; themes have no
 * implementation yet, so only "Dark" (the current look) is selected and the rest is disabled.
 */
export function SettingsAppearanceTab() {
  const { t } = useTranslation();
  const { language, setLanguage } = useI18nContext();

  const themeLabels: Record<(typeof BASE_THEMES)[number]["value"], string> = {
    dark: t("settings.appearance.theme.dark"),
    light: t("settings.appearance.theme.light"),
    system: t("settings.appearance.theme.system"),
  };

  return (
    <>
      <SettingsSection
        title={t("settings.appearance.language.title")}
        description={t("settings.appearance.language.description")}
      >
        <Radio.Group
          value={language}
          onChange={(value) => {
            const option = LANGUAGE_OPTIONS.find(
              (item) => item.value === value,
            );
            if (option) setLanguage(option.value);
          }}
          label={t("settings.appearance.language.title")}
          classNames={{ root: "w-full", label: "sr-only" }}
        >
          <SettingsCard>
            {LANGUAGE_OPTIONS.map((option) => {
              const checked = option.value === language;
              return (
                <Radio.Card
                  key={option.value}
                  value={option.value}
                  withBorder={false}
                  radius={0}
                  className={
                    "transition-colors hover:bg-[#1f1f1f] focus-visible:!outline-offset-[-2px]"
                  }
                >
                  <Box
                    component={"span"}
                    className={"flex items-center gap-4 px-5 py-4"}
                  >
                    <SettingsRadioDot checked={checked} />
                    <Text
                      component={"span"}
                      fz={14}
                      fw={600}
                      c={"white"}
                      lh={"normal"}
                      lang={option.value}
                      className={"min-w-0 flex-1"}
                    >
                      {option.label}
                    </Text>
                    {checked && (
                      <SettingsPill>
                        {t("settings.badges.current")}
                      </SettingsPill>
                    )}
                  </Box>
                </Radio.Card>
              );
            })}
          </SettingsCard>
        </Radio.Group>
      </SettingsSection>
      <SettingsSection
        title={t("settings.appearance.theme.title")}
        description={t("settings.appearance.theme.description")}
      >
        <Radio.Group
          value={CURRENT_THEME}
          label={t("settings.appearance.theme.title")}
          classNames={{ root: "w-full", label: "sr-only" }}
        >
          <Box className={"@container w-full"}>
            <Box className={"grid grid-cols-1 gap-3 @[480px]:grid-cols-3"}>
              {BASE_THEMES.map((theme) => (
                <SettingsThemeOptionCard
                  key={theme.value}
                  value={theme.value}
                  label={themeLabels[theme.value]}
                  description={
                    theme.value === "system"
                      ? t("settings.appearance.theme.systemDescription")
                      : undefined
                  }
                  palette={theme.palette}
                  checked={theme.value === CURRENT_THEME}
                  disabled={theme.value !== CURRENT_THEME}
                />
              ))}
            </Box>
          </Box>
        </Radio.Group>
      </SettingsSection>
      <SettingsSection
        title={t("settings.appearance.specialThemes.title")}
        description={t("settings.appearance.specialThemes.description")}
        rightSection={<SettingsComingSoonBadge />}
      >
        <Radio.Group
          value={null}
          label={t("settings.appearance.specialThemes.title")}
          classNames={{ root: "w-full", label: "sr-only" }}
        >
          <Box className={"@container w-full"}>
            <Box className={"grid grid-cols-2 gap-3 @[560px]:grid-cols-4"}>
              {SPECIAL_THEMES.map((theme) => (
                <SettingsThemeOptionCard
                  key={theme.value}
                  value={theme.value}
                  label={theme.name}
                  description={t(
                    `settings.appearance.specialThemes.${theme.value}`,
                  )}
                  palette={theme.palette}
                  checked={false}
                  disabled
                  withComingSoonBadge={false}
                />
              ))}
            </Box>
          </Box>
        </Radio.Group>
        <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
          {t("settings.appearance.specialThemes.disclaimer")}
        </Text>
      </SettingsSection>
    </>
  );
}
