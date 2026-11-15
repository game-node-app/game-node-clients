import { Modal } from "#@/util";
import { useTranslation } from "@repo/locales";
import { Badge, Box, Group, Stack, Text } from "@mantine/core";
import {
  formatFeatDate,
  type FeatItem,
  type FeatsEventGroup,
} from "../util/feats";

export interface FeatsPastEventsModalProps {
  opened: boolean;
  onClose: () => void;
  pastEvents: readonly FeatsEventGroup[];
}

interface PastEventFeatProps {
  item: FeatItem;
  locale?: string;
}

const PastEventFeat = ({ item, locale }: PastEventFeatProps) => {
  const { t } = useTranslation();

  if (item.state === "secret") {
    return (
      <Stack gap={4}>
        <Group gap={8} wrap={"nowrap"}>
          <Text fz={14} fw={600} lh={"normal"} className={"text-white"}>
            {t("achievements.card.secretTitle")}
          </Text>
          <Badge variant={"light"} color={"gray"} size={"xs"}>
            {t("achievements.card.secretBadge")}
          </Badge>
        </Group>
        <Text fz={12} lh={"normal"} className={"text-[#7a7a7a]"}>
          {t("achievements.events.noLongerObtainable")}
        </Text>
      </Stack>
    );
  }

  const obtainedTier = item.progress?.tier ?? 0;

  return (
    <Stack gap={6}>
      <Text fz={14} fw={600} lh={"normal"} className={"text-white"}>
        {item.achievement.name}
      </Text>

      {item.achievement.tiers.map((tier) => {
        const obtained = tier.level <= obtainedTier;
        const obtainedAt = item.progress?.obtainedTiers?.find(
          (it) => it.level === tier.level,
        )?.obtainedAt;

        return (
          <Group
            key={tier.level}
            justify={"space-between"}
            gap={12}
            wrap={"nowrap"}
          >
            <Badge
              variant={"light"}
              color={obtained ? "teal" : "gray"}
              size={"sm"}
            >
              {t("achievements.card.tier", { level: tier.level })}
            </Badge>
            <Text
              fz={12}
              lh={"normal"}
              className={obtained ? "text-teal-400" : "text-[#7a7a7a]"}
              ta={"right"}
            >
              {obtained
                ? obtainedAt
                  ? t("achievements.tiers.obtainedAt", {
                      date: formatFeatDate(obtainedAt, locale),
                    })
                  : t("achievements.tiers.obtained")
                : t("achievements.events.noLongerObtainable")}
            </Text>
          </Group>
        );
      })}
    </Stack>
  );
};

/**
 * Every ended event with its feats, including the ones the viewed user did not
 * obtain. Partial feats list all obtained tiers and mark the rest unavailable.
 */
const FeatsPastEventsModal = ({
  opened,
  onClose,
  pastEvents,
}: FeatsPastEventsModalProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n?.resolvedLanguage || i18n?.language;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("achievements.events.pastEvents")}
      size={"lg"}
      breakpoints={[0, 0.75, 1]}
      initialBreakpoint={0.75}
    >
      <Stack gap={16}>
        <Text fz={14} lh={"normal"} className={"text-[#a6a6a6]"}>
          {t("achievements.events.pastEventsDescription")}
        </Text>

        {pastEvents.length === 0 && (
          <Text fz={14} c={"dimmed"}>
            {t("achievements.filters.empty")}
          </Text>
        )}

        {pastEvents.map((group) => (
          <Box
            key={group.id}
            className={"rounded-xl border border-paper-4 bg-paper-7 p-4"}
          >
            <Stack gap={12}>
              <Stack gap={2}>
                <Text fz={16} fw={600} lh={"normal"} className={"text-white"}>
                  {group.event.name}
                </Text>
                <Text fz={13} lh={"normal"} className={"text-[#a6a6a6]"}>
                  {group.event.description}
                </Text>
              </Stack>

              <Stack gap={12}>
                {group.items.map((item) => (
                  <PastEventFeat
                    key={item.achievement.id}
                    item={item}
                    locale={locale}
                  />
                ))}
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Modal>
  );
};

export { FeatsPastEventsModal };
