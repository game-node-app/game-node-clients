import { Box, Group, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCheck } from "@tabler/icons-react";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";

export interface SupporterAlwaysFreeCardProps {
  className?: string;
}

const ALWAYS_FREE_ITEM_KEYS = [
  "supporter.benefits.available.library",
  "supporter.benefits.available.imports",
  "supporter.benefits.available.achievements",
  "supporter.benefits.available.reviews",
  "supporter.benefits.available.journal",
  "supporter.benefits.available.collections",
] as const;

/** Compact reminder of what stays free with or without a subscription. */
export function SupporterAlwaysFreeCard({
  className,
}: SupporterAlwaysFreeCardProps) {
  const { t } = useTranslation();

  return (
    <SettingsSection
      title={t("supporter.alwaysFree.title")}
      description={t("supporter.alwaysFree.description")}
      className={className}
    >
      <SettingsCard
        withDividers={false}
        data-testid={"supporter-always-free-card"}
        className={"@container p-5"}
      >
        <Box
          className={"grid grid-cols-2 gap-x-4 gap-y-3 @[600px]:grid-cols-3"}
        >
          {ALWAYS_FREE_ITEM_KEYS.map((key) => (
            <Group key={key} gap={8} wrap={"nowrap"} align={"flex-start"}>
              <IconCheck
                size={16}
                stroke={2.5}
                aria-hidden
                className={"mt-0.5 shrink-0 text-brand-5"}
              />
              <Text fz={13} lh={"18px"} className={"text-[#d9d9d9]"}>
                {t(key)}
              </Text>
            </Group>
          ))}
        </Box>
      </SettingsCard>
    </SettingsSection>
  );
}
