import { Box, Radio, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { GameCoverMode } from "#@/components/game/util/gameCoverRequest";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsPill } from "#@/components/settings/common/SettingsPill";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { useCustomCoverModeSetting } from "#@/components/settings/hooks/useCustomCoverModeSetting";
import { SettingsRadioDot } from "#@/components/settings/tabs/appearance/SettingsThemeOptionCard";

/** The three display modes, in the order they are explained. */
const CUSTOM_COVER_MODES: GameCoverMode[] = ["any", "prefer_yours", "none"];

interface Props {
  /** Hides the section header when the container already provides one (e.g. a modal title). */
  showHeader?: boolean;
}

/**
 * "Custom covers" display mode setting (design Decision 10). Saved on change;
 * only shown to signed-in users, since it is an account setting.
 */
export function SettingsCustomCoversSection({ showHeader = true }: Props = {}) {
  const { t } = useTranslation();
  const userId = useUserId();
  const { mode, hasProfile, isPending, setMode } = useCustomCoverModeSetting();

  if (!userId) {
    return null;
  }

  const options = (
    <Radio.Group
      value={hasProfile ? mode : null}
      onChange={(value) => {
        if (!hasProfile || isPending || value === mode) {
          return;
        }
        setMode(value as GameCoverMode);
      }}
      label={t("settings.appearance.customCovers.title")}
      classNames={{ root: "w-full", label: "sr-only" }}
    >
      <SettingsCard>
        {CUSTOM_COVER_MODES.map((option) => {
          const checked = hasProfile && option === mode;
          return (
            <Radio.Card
              key={option}
              value={option}
              disabled={!hasProfile || isPending}
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
                <Box
                  component={"span"}
                  className={"flex min-w-0 flex-1 flex-col gap-0.5"}
                >
                  <Text
                    component={"span"}
                    fz={14}
                    fw={600}
                    c={"white"}
                    lh={"normal"}
                  >
                    {t(`settings.appearance.customCovers.${option}.label`)}
                  </Text>
                  <Text
                    component={"span"}
                    fz={13}
                    lh={"18px"}
                    className={"text-[#adadad]"}
                  >
                    {t(
                      `settings.appearance.customCovers.${option}.description`,
                    )}
                  </Text>
                </Box>
                {checked && (
                  <SettingsPill>{t("settings.badges.current")}</SettingsPill>
                )}
              </Box>
            </Radio.Card>
          );
        })}
      </SettingsCard>
    </Radio.Group>
  );

  if (!showHeader) {
    return options;
  }

  return (
    <SettingsSection
      title={t("settings.appearance.customCovers.title")}
      description={t("settings.appearance.customCovers.description")}
    >
      {options}
    </SettingsSection>
  );
}
