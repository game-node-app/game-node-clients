import { Box, Radio, Text } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { LANGUAGE_OPTIONS } from "#@/components/general/LanguagePickerMenu/LanguageSwitcherMenu";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsPill } from "#@/components/settings/common/SettingsPill";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SettingsRuinsOptionsSection } from "#@/components/settings/tabs/appearance/SettingsRuinsOptionsSection";
import { SettingsCustomCoversSection } from "#@/components/settings/tabs/appearance/SettingsCustomCoversSection";
import {
  SettingsRadioDot,
  SettingsThemeOptionCard,
  SettingsThemePalette,
} from "#@/components/settings/tabs/appearance/SettingsThemeOptionCard";
import {
  useAppTheme,
  useHasSupporterThemeAccess,
} from "#@/theme/AppThemeProvider";
import {
  DEFAULT_THEME_ID,
  isThemeId,
  THEME_CATALOG,
  THEMES_BY_ID,
  type ThemeId,
} from "#@/theme/generated/catalog";

type UnavailableThemeValue =
  | "light"
  | "system"
  | "steam"
  | "playstation"
  | "nintendo";
type ThemeValue = ThemeId | UnavailableThemeValue;

/** Themes shown in the main "Theme" selector next to the unavailable ones. */
const BASE_THEME_ORDER = [DEFAULT_THEME_ID, "light", "system"] as const;
const RUINS_THEME_ID = "ruins" satisfies ThemeId;
const SPECIAL_THEME_ORDER = Array.from(
  new Set<ThemeValue>([
    "steam",
    ...THEME_CATALOG.filter(
      (entry) =>
        !entry.isDefault &&
        !(BASE_THEME_ORDER as readonly ThemeValue[]).includes(entry.id),
    ).map((entry) => entry.id),
    "playstation",
    "nintendo",
  ]),
);

type AppearanceThemeOption = {
  value: ThemeValue;
  label: string;
  description?: string;
  palette: SettingsThemePalette;
  disabled: boolean;
  locked?: boolean;
  isNew?: boolean;
};

const UNAVAILABLE_THEME_LABELS = {
  light: "settings.appearance.theme.light",
  system: "settings.appearance.theme.system",
} as const;

/** Store names are proper nouns and are not translated. */
const STORE_THEME_NAMES = {
  steam: "Steam",
  playstation: "PlayStation",
  nintendo: "Nintendo",
} as const;

const THEME_DESCRIPTION_KEYS = {
  system: "settings.appearance.theme.systemDescription",
  xbox: "settings.appearance.specialThemes.xbox",
  ruins: "settings.appearance.theme.ruinsDescription",
  steam: "settings.appearance.specialThemes.steam",
  playstation: "settings.appearance.specialThemes.playstation",
  nintendo: "settings.appearance.specialThemes.nintendo",
} as const;

// theme-exempt: fixed swatches illustrate the miniature previews of unavailable themes.
const UNAVAILABLE_THEME_PREVIEWS: Record<
  UnavailableThemeValue,
  SettingsThemePalette
> = {
  light: {
    background: "#f4f4f5",
    sidebar: "#e4e4e7",
    title: "#18181b",
    text: "#7a7a7a",
    accent: THEMES_BY_ID[DEFAULT_THEME_ID].preview.accent,
  },
  system: {
    background: "#2a2a2a",
    sidebar: "#1a1a1a",
    title: "#ffffff",
    text: "#7a7a7a",
    accent: THEMES_BY_ID[DEFAULT_THEME_ID].preview.accent,
  },
  steam: {
    background: "#1b2838",
    sidebar: "#171a21",
    title: "#ffffff",
    text: "#8f98a0",
    accent: "#66c0f4",
  },
  playstation: {
    background: "#001d4a",
    sidebar: "#00439c",
    title: "#ffffff",
    text: "#a9c4eb",
    accent: "#0070d1",
  },
  nintendo: {
    background: "#ffffff",
    sidebar: "#e6e6e6",
    title: "#1a1a1a",
    text: "#8a8a8a",
    accent: "#e60012",
    bordered: true,
  },
};

export function SettingsAppearanceTab() {
  const { t } = useTranslation();
  const { language, setLanguage } = useI18nContext();
  const [themeId, setTheme] = useAppTheme();
  const hasSupporterThemeAccess = useHasSupporterThemeAccess();

  const optionFor = (value: ThemeValue): AppearanceThemeOption => {
    if (isThemeId(value)) {
      const entry = THEMES_BY_ID[value];
      const locked = !entry.isDefault && !hasSupporterThemeAccess;
      return {
        value,
        label: t(entry.labelKey),
        description:
          value === "xbox" || value === "ruins"
            ? t(THEME_DESCRIPTION_KEYS[value])
            : undefined,
        palette:
          entry.colorScheme === "light"
            ? { ...entry.preview, bordered: true }
            : entry.preview,
        disabled: locked,
        locked,
        isNew: value === "ruins",
      };
    }

    if (value === "light") {
      return {
        value,
        label: t(UNAVAILABLE_THEME_LABELS.light),
        palette: UNAVAILABLE_THEME_PREVIEWS.light,
        disabled: true,
      };
    }

    if (value === "system") {
      return {
        value,
        label: t(UNAVAILABLE_THEME_LABELS.system),
        description: t(THEME_DESCRIPTION_KEYS.system),
        palette: UNAVAILABLE_THEME_PREVIEWS.system,
        disabled: true,
      };
    }

    return {
      value,
      label: STORE_THEME_NAMES[value],
      description: t(THEME_DESCRIPTION_KEYS[value]),
      palette: UNAVAILABLE_THEME_PREVIEWS[value],
      disabled: true,
    };
  };

  const baseOptions = BASE_THEME_ORDER.map(optionFor);
  const specialOptions = SPECIAL_THEME_ORDER.map(optionFor);
  const baseValue = baseOptions.some((option) => option.value === themeId)
    ? themeId
    : null;
  const specialValue = specialOptions.some((option) => option.value === themeId)
    ? themeId
    : null;

  const selectTheme = (value: string | null) => {
    if (value && isThemeId(value)) {
      setTheme(value);
    }
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
                    "transition-colors hover:bg-[var(--gn-dark-8)] focus-visible:!outline-offset-[-2px]"
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
                      c={"var(--gn-text)"}
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
        sectionId={"theme"}
        title={t("settings.appearance.theme.title")}
        description={t("settings.appearance.theme.description")}
      >
        <Radio.Group
          value={baseValue}
          onChange={selectTheme}
          label={t("settings.appearance.theme.title")}
          classNames={{ root: "w-full", label: "sr-only" }}
        >
          <Box className={"@container w-full"}>
            <Box
              className={
                "grid grid-cols-1 gap-3 @[480px]:grid-cols-2 @[720px]:grid-cols-4"
              }
            >
              {baseOptions.map((option) => (
                <SettingsThemeOptionCard
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                  palette={option.palette}
                  checked={option.value === themeId}
                  disabled={option.disabled}
                  locked={option.locked}
                  isNew={option.isNew}
                />
              ))}
            </Box>
          </Box>
        </Radio.Group>
      </SettingsSection>
      <SettingsSection
        title={t("settings.appearance.specialThemes.title")}
        description={t("settings.appearance.specialThemes.description")}
      >
        <Radio.Group
          value={specialValue}
          onChange={selectTheme}
          label={t("settings.appearance.specialThemes.title")}
          classNames={{ root: "w-full", label: "sr-only" }}
        >
          <Box className={"@container w-full"}>
            <Box className={"grid grid-cols-2 gap-3 @[560px]:grid-cols-4"}>
              {specialOptions.map((option) => (
                <SettingsThemeOptionCard
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  description={option.description}
                  palette={option.palette}
                  checked={option.value === themeId}
                  disabled={option.disabled}
                  locked={option.locked}
                  isNew={option.isNew}
                />
              ))}
            </Box>
          </Box>
        </Radio.Group>
        <Text fz={12} lh={"normal"} className={"text-dimmed-3"}>
          {t("settings.appearance.specialThemes.disclaimer")}
        </Text>
        <Text fz={12} lh={"normal"} className={"text-dimmed-3"}>
          {t("settings.appearance.theme.ruinsDisclaimer")}
        </Text>
      </SettingsSection>
      {themeId === RUINS_THEME_ID && <SettingsRuinsOptionsSection />}
      <SettingsCustomCoversSection />
    </>
  );
}
