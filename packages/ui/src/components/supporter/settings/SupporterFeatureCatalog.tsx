import { Box, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  IconBroadcast,
  IconBrush,
  IconCircleDashed,
  IconCrown,
  IconHeart,
  IconPhoto,
  IconProps,
  IconStack2,
} from "@tabler/icons-react";
import { ComponentType } from "react";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsComingSoonBadge } from "#@/components/settings/common/SettingsPill";
import {
  SettingsIconTile,
  SettingsRow,
} from "#@/components/settings/common/SettingsRow";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { SupporterProfilePreview } from "./SupporterProfilePreview";

export interface SupporterFeatureCatalogProps {
  isSupporter: boolean;
  /** Server-provided start of the subscription, forwarded to the preview. */
  supporterSince: string | null;
  className?: string;
}

interface FeatureDefinition {
  titleKey: string;
  descriptionKey: string;
  Icon: ComponentType<IconProps>;
}

const FEATURE_GROUPS = [
  {
    labelKey: "supporter.features.groups.profile",
    features: [
      {
        titleKey: "supporter.benefits.upcoming.theme",
        descriptionKey: "supporter.features.theme.description",
        Icon: IconBrush,
      },
      {
        titleKey: "supporter.benefits.upcoming.badge",
        descriptionKey: "supporter.features.badge.description",
        Icon: IconCrown,
      },
      {
        titleKey: "supporter.benefits.upcoming.animatedBorder",
        descriptionKey: "supporter.features.animatedBorder.description",
        Icon: IconCircleDashed,
      },
      {
        titleKey: "supporter.benefits.upcoming.liveProfile",
        descriptionKey: "supporter.features.liveProfile.description",
        Icon: IconBroadcast,
      },
    ],
  },
  {
    labelKey: "supporter.features.groups.library",
    features: [
      {
        titleKey: "supporter.benefits.upcoming.customCovers",
        descriptionKey: "supporter.features.customCovers.description",
        Icon: IconPhoto,
      },
      {
        titleKey: "supporter.benefits.upcoming.collectionLimit",
        descriptionKey: "supporter.features.collectionLimit.description",
        Icon: IconStack2,
      },
    ],
  },
  {
    labelKey: "supporter.features.groups.community",
    features: [
      {
        titleKey: "supporter.benefits.upcoming.wall",
        descriptionKey: "supporter.features.wall.description",
        Icon: IconHeart,
      },
    ],
  },
] as const satisfies readonly {
  labelKey: string;
  features: readonly FeatureDefinition[];
}[];

/**
 * Upcoming supporter features. Every row is informational and says "Coming
 * soon" for free users and supporters alike: there is no switch, lock or
 * chevron, and nothing here is focusable. The profile preview sits beside the
 * list at >=600px container width.
 */
export function SupporterFeatureCatalog({
  isSupporter,
  supporterSince,
  className,
}: SupporterFeatureCatalogProps) {
  const { t } = useTranslation();

  return (
    <SettingsSection
      title={t("supporter.features.title")}
      description={
        isSupporter
          ? t("supporter.features.descriptionSupporter")
          : t("supporter.features.descriptionFree")
      }
      rightSection={<SettingsComingSoonBadge />}
      className={className}
    >
      <Box className={"@container w-full"}>
        <Box
          data-testid={"supporter-feature-catalog"}
          className={
            "grid grid-cols-1 gap-5 @[600px]:grid-cols-[minmax(0,1fr)_280px]"
          }
        >
          <Stack gap={16}>
            {FEATURE_GROUPS.map((group) => (
              <Stack key={group.labelKey} gap={8}>
                <Text
                  fz={13}
                  fw={600}
                  lh={"normal"}
                  className={"text-[#adadad]"}
                >
                  {t(group.labelKey)}
                </Text>
                <SettingsCard>
                  {group.features.map((feature) => (
                    <SettingsRow
                      key={feature.titleKey}
                      leftSection={
                        <SettingsIconTile
                          Icon={feature.Icon}
                          className={"bg-[rgba(151,71,255,0.16)]"}
                          iconClassName={"text-[#c7a6ff]"}
                        />
                      }
                      title={t(feature.titleKey)}
                      description={t(feature.descriptionKey)}
                      rightSection={<SettingsComingSoonBadge />}
                    />
                  ))}
                </SettingsCard>
              </Stack>
            ))}
          </Stack>

          <SupporterProfilePreview supporterSince={supporterSince} />
        </Box>
      </Box>
    </SettingsSection>
  );
}
