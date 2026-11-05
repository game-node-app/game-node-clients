import { Anchor, Box, Group, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  IconAward,
  IconBrush,
  IconCrown,
  IconExternalLink,
  IconHeartHandshake,
  IconLock,
} from "@tabler/icons-react";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsRow } from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SettingsLockedSwitch } from "#@/components/settings/tabs/notifications/SettingsLockedSwitch";
import { SettingsPremiumProfilePreview } from "#@/components/settings/tabs/premium/SettingsPremiumProfilePreview";
import { SETTINGS_PREMIUM_URL } from "#@/components/settings/tabs/premium/settingsPremiumLinks";

const PREMIUM_FEATURES = [
  { key: "profileTheme", Icon: IconBrush },
  { key: "badge", Icon: IconCrown },
  { key: "title", Icon: IconAward },
  { key: "list", Icon: IconHeartHandshake },
] as const;

function PremiumHeroCard() {
  const { t } = useTranslation();

  return (
    <SettingsCard className={"@container"}>
      <Box
        className={
          "flex flex-col gap-4 p-6 @[560px]:flex-row @[560px]:items-center @[560px]:gap-5"
        }
      >
        <Group gap={20} wrap={"nowrap"} className={"min-w-0 flex-1"}>
          <Box
            className={
              "flex size-[52px] shrink-0 items-center justify-center rounded-[14px] border border-solid border-[rgba(151,71,255,0.4)] bg-[rgba(151,71,255,0.16)] text-[#c7a6ff]"
            }
          >
            <IconCrown size={24} aria-hidden />
          </Box>
          <Stack gap={6} className={"min-w-0 flex-1"}>
            <Text fz={18} fw={600} c={"white"} lh={"normal"}>
              {t("settings.premium.hero.title")}
            </Text>
            <Text fz={13} lh={"19px"} className={"text-[#adadad]"}>
              {t("settings.premium.hero.description")}
            </Text>
          </Stack>
        </Group>
        <SettingsButton
          component={"a"}
          href={SETTINGS_PREMIUM_URL}
          target={"_blank"}
          rel={"noopener noreferrer"}
          variant={"primary"}
          rightSection={<IconExternalLink size={14} aria-hidden />}
          className={"shrink-0 self-start @[560px]:self-auto"}
        >
          {t("settings.premium.hero.cta")}
        </SettingsButton>
      </Box>
    </SettingsCard>
  );
}

function PremiumFeaturesCard() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <SettingsCard className={"min-w-0 flex-1"}>
      {PREMIUM_FEATURES.map(({ key, Icon }) => {
        const label = t(`settings.premium.features.${key}.label`);
        return (
          <SettingsRow
            key={key}
            Icon={Icon}
            title={label}
            description={t(`settings.premium.features.${key}.description`, {
              year,
            })}
            disabled
            rightSection={
              <Group gap={8} wrap={"nowrap"} className={"text-[#7a7a7a]"}>
                <IconLock size={14} aria-hidden />
                <SettingsLockedSwitch label={label} />
              </Group>
            }
          />
        );
      })}
      <Group
        gap={8}
        wrap={"nowrap"}
        className={"bg-[#151515] px-5 py-3 text-[#7a7a7a]"}
      >
        <IconLock size={14} aria-hidden className={"shrink-0"} />
        <Text fz={12} lh={"normal"} c={"inherit"}>
          {t("settings.premium.appearance.lockedNote")}
        </Text>
      </Group>
    </SettingsCard>
  );
}

/**
 * Premium tab. There is no subscription API (Premium is sold through Patreon), so
 * this always renders the "not a subscriber" state with a preview built from the
 * user's real profile.
 */
export function SettingsPremiumTab() {
  const { t } = useTranslation();
  const supportEmail = t("legal.privacy.contactEmail");

  return (
    <>
      <PremiumHeroCard />
      <SettingsSection
        title={t("settings.premium.appearance.title")}
        description={t("settings.premium.appearance.description")}
      >
        <Box className={"@container w-full"}>
          <Box
            className={
              "flex flex-col gap-4 @[600px]:flex-row @[600px]:items-start"
            }
          >
            <PremiumFeaturesCard />
            <Stack
              gap={8}
              className={"w-full max-w-[360px] shrink-0 @[600px]:w-[262px]"}
            >
              <Text fz={12} fw={500} lh={"normal"} className={"text-[#7a7a7a]"}>
                {t("settings.premium.preview.label")}
              </Text>
              <SettingsPremiumProfilePreview />
            </Stack>
          </Box>
        </Box>
      </SettingsSection>
      <Text fz={13} lh={"normal"} className={"text-[#7a7a7a]"}>
        {t("settings.premium.billingHelp")}{" "}
        <Anchor
          href={`mailto:${supportEmail}`}
          inherit
          underline={"always"}
          className={"text-[#adadad] hover:text-white"}
        >
          {supportEmail}
        </Anchor>
        .
      </Text>
    </>
  );
}
