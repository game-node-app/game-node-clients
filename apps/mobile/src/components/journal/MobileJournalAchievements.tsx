import { CardSection } from "@/components/general/card";
import { ActionIcon, Popover, SegmentedControl } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  BackToTopButton,
  CenteredLoading,
  JournalAchievementsCompactLayoutView,
  JournalAchievementsDetailedLayoutView,
  useJournalObtainedAchievements,
  UserAvatarWithLevelInfo,
  useUserId,
} from "@repo/ui";
import { IconInfoCircle } from "@tabler/icons-react";
import { useState } from "react";

interface Props {
  userId: string;
  withUserInfo?: boolean;
}

/**
 * Mobile restyle of `JournalObtainedAchievementsView`: header card, segmented layout toggle
 * and the tip as a card note. Data and list layouts are the shared ones from `@repo/ui`.
 */
export const MobileJournalAchievements = ({
  userId,
  withUserInfo = false,
}: Props) => {
  const { t } = useTranslation();
  const isOwnJournal = useUserId() === userId;
  const [layout, setLayout] = useState<"compact" | "detailed">("compact");
  const { data, isLoading } = useJournalObtainedAchievements(userId);
  const groups = data?.years || [];

  return (
    <div className="flex w-full flex-col gap-4 pb-6 pt-3">
      <BackToTopButton />
      {withUserInfo && <UserAvatarWithLevelInfo userId={userId} />}
      <div className="flex items-center gap-2 px-4">
        <SegmentedControl
          fullWidth
          size="xs"
          className="flex-1"
          value={layout}
          onChange={(value) => setLayout(value as "compact" | "detailed")}
          data={[
            { value: "compact", label: t("view.compact") },
            { value: "detailed", label: t("view.detailed") },
          ]}
        />
        {isOwnJournal && (
          <Popover position="bottom-end">
            <Popover.Target>
              <ActionIcon
                variant="default"
                size="lg"
                aria-label={t("journal.achievements.helpLabel")}
              >
                <IconInfoCircle size={18} />
              </ActionIcon>
            </Popover.Target>
            <Popover.Dropdown>
              <div className="w-full max-w-60">
                <p className="m-0 text-sm">
                  {t("journal.achievements.description")}
                </p>
                <p className="m-0 mt-2 text-sm text-dimmed">
                  {t("journal.achievements.autoUpdate")}
                </p>
                <p className="m-0 mt-2 text-sm text-dimmed">
                  {t("journal.achievements.updateNote")}
                </p>
              </div>
            </Popover.Dropdown>
          </Popover>
        )}
      </div>
      <CardSection>
        <p className="m-0 p-3 text-[13px] leading-5 text-dimmed-1">
          <span className="font-semibold text-white">
            {t("journal.achievements.tipLabel")}
          </span>
          {t("journal.achievements.tipAction", {
            action: t("journal.achievements.tap"),
          })}
        </p>
      </CardSection>
      {isLoading && (
        <CenteredLoading message={t("journal.achievements.loading")} />
      )}
      <div className="px-4">
        {layout === "compact" ? (
          <JournalAchievementsCompactLayoutView
            userId={userId}
            groups={groups}
          />
        ) : (
          <JournalAchievementsDetailedLayoutView
            userId={userId}
            groups={groups}
          />
        )}
      </div>
    </div>
  );
};
