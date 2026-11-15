import { AchievementBadge } from "#@/components/achievement/AchievementBadge";
import { useFeatureFeat } from "#@/components/achievement/hooks/useFeatureFeat";
import type { FeatItem } from "#@/components/achievement/util/feats";
import { BaseModalProps, cn, Modal } from "#@/util";
import { Stack, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCheck } from "@tabler/icons-react";

export interface FeatFeaturedPickerProps extends BaseModalProps {
  targetUserId: string;
  /** Obtained feats the user can feature. */
  items: FeatItem[];
  featuredAchievementId?: string | null;
}

/**
 * Picks the single feat featured on the profile. Other featured feats are
 * removed by the server, so selecting one replaces the previous choice.
 */
const FeatFeaturedPicker = ({
  opened,
  onClose,
  targetUserId,
  items,
  featuredAchievementId,
}: FeatFeaturedPickerProps) => {
  const { t } = useTranslation();
  const featureFeatMutation = useFeatureFeat(targetUserId);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("achievements.featured.title")}
      breakpoints={[0, 0.75, 1]}
      initialBreakpoint={0.75}
      size={"md"}
      centered
    >
      <Stack gap={"xs"}>
        <Text fz={13} c={"dimmed"}>
          {t("achievements.featured.help")}
        </Text>

        {items.length === 0 && (
          <Text fz={14} c={"dimmed"} ta={"center"} py={"md"}>
            {t("achievements.filters.empty")}
          </Text>
        )}

        {items.map((item) => {
          const selected = item.achievement.id === featuredAchievementId;

          return (
            <UnstyledButton
              key={item.achievement.id}
              data-feat-id={item.achievement.id}
              data-selected={selected || undefined}
              disabled={featureFeatMutation.isPending}
              aria-pressed={selected}
              onClick={() => {
                featureFeatMutation.mutate(item.achievement.id, {
                  onSuccess: onClose,
                });
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors",
                selected
                  ? "border-brand bg-brand-0/10"
                  : "border-paper-4 bg-paper-7 hover:border-brand-7",
                featureFeatMutation.isPending && "opacity-60",
              )}
            >
              <AchievementBadge
                icon={item.achievement.icon}
                tier={item.progress?.tier ?? 0}
                size={40}
                variant={"tile"}
              />
              <Stack gap={0} className={"min-w-0 flex-1"}>
                <Text fz={14} fw={600} truncate>
                  {item.achievement.name}
                </Text>
                <Text fz={12} c={"dimmed"}>
                  {t("achievements.card.tier", {
                    level: item.displayTier,
                  })}
                </Text>
              </Stack>
              {selected && <IconCheck size={18} className={"shrink-0"} />}
            </UnstyledButton>
          );
        })}
      </Stack>
    </Modal>
  );
};

export { FeatFeaturedPicker };
