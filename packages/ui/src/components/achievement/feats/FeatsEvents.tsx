import { AchievementBadge } from "#@/components/achievement/AchievementBadge";
import { useTranslation } from "@repo/locales";
import {
  Badge,
  Box,
  Group,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";
import {
  formatFeatDate,
  formatFeatNumber,
  type FeatsEventGroup,
} from "../util/feats";
import { FeatsPastEventsModal } from "./FeatsPastEventsModal";

export interface FeatsEventsProps {
  /** Rows of the section: active events and ended events with an obtained feat. */
  events: readonly FeatsEventGroup[];
  /** Every ended event, used by the "Past events" list. */
  pastEvents: readonly FeatsEventGroup[];
  /** Opens the past events list. When omitted, the component owns the modal. */
  onOpenPastEvents?: () => void;
}

/**
 * Events section: one row per active event and per ended event the viewed user
 * obtained a feat from. Upcoming events and ended events without obtained feats
 * are never listed.
 */
const FeatsEvents = ({
  events,
  pastEvents,
  onOpenPastEvents,
}: FeatsEventsProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n?.resolvedLanguage || i18n?.language;
  const [modalOpened, modalUtils] = useDisclosure(false);

  const rows = events.filter(
    (group) => !group.isPast || group.obtainedCount > 0,
  );

  if (rows.length === 0) return null;

  const openPastEvents = onOpenPastEvents ?? modalUtils.open;

  return (
    <Stack gap={16}>
      <Group justify={"space-between"} align={"flex-end"} gap={12}>
        <Stack gap={4} className={"min-w-0"}>
          <Title order={2} fz={18} fw={600} className={"text-white"}>
            {t("achievements.events.title")}
          </Title>
          <Text fz={14} lh={"normal"} className={"text-dimmed-1"}>
            {t("achievements.events.subtitle")}
          </Text>
        </Stack>

        {pastEvents.length > 0 && (
          <UnstyledButton
            onClick={openPastEvents}
            className={
              "flex shrink-0 items-center gap-1.5 text-sm text-emphasis hover:text-white"
            }
          >
            {t("achievements.events.pastEvents")}
            <IconChevronRight size={18} />
          </UnstyledButton>
        )}
      </Group>

      <Stack gap={12}>
        {rows.map((group) => {
          const eventTier = group.items.reduce(
            (highest, item) => Math.max(highest, item.progress?.tier ?? 0),
            0,
          );

          return (
            <Box
              key={group.id}
              className={
                "rounded-2xl border border-paper-4 bg-paper-7 p-4 lg:p-5"
              }
            >
              <Group gap={16} align={"flex-start"} wrap={"nowrap"}>
                <AchievementBadge
                  icon={group.items[0]?.achievement.icon ?? null}
                  tier={eventTier}
                  size={46}
                  variant={"tile"}
                />
                <Stack gap={4} className={"min-w-0 flex-1"}>
                  <Text fz={17} fw={600} lh={"normal"} className={"text-white"}>
                    {group.event.name}
                  </Text>
                  <Text fz={14} lh={"normal"} className={"text-dimmed-2"}>
                    {group.event.description}
                  </Text>
                  <Group gap={8} mt={4} wrap={"wrap"}>
                    <Text fz={13} lh={"normal"} className={"text-dimmed-1"}>
                      {group.isPast
                        ? t("achievements.events.ended")
                        : t("achievements.events.endsAt", {
                            date: formatFeatDate(group.event.endsAt, locale),
                          })}
                    </Text>
                    {group.obtainedCount > 0 && (
                      <Badge variant={"light"} color={"teal"} size={"sm"}>
                        {t("achievements.events.obtained", {
                          xp: formatFeatNumber(group.earnedXp, locale),
                        })}
                      </Badge>
                    )}
                  </Group>
                </Stack>
              </Group>
            </Box>
          );
        })}
      </Stack>

      {!onOpenPastEvents && (
        <FeatsPastEventsModal
          opened={modalOpened}
          onClose={modalUtils.close}
          pastEvents={pastEvents}
        />
      )}
    </Stack>
  );
};

export { FeatsEvents };
