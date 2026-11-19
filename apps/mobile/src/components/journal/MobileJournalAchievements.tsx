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
 * Mobile restyle of `JournalObtainedAchievementsView`: header card and segmented layout toggle
 * (the help popover holds the notes and the tip). Data and list layouts are the shared ones from `@repo/ui`.
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
      <div className="flex items-center gap-2">
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
                <p className="m-0 mt-2 text-sm">
                  <span className="font-semibold">
                    {t("journal.achievements.tipLabel")}
                  </span>
                  {t("journal.achievements.tipAction", {
                    action: t("journal.achievements.tap"),
                  })}
                </p>
              </div>
            </Popover.Dropdown>
          </Popover>
        )}
      </div>
      {isLoading && (
        <CenteredLoading message={t("journal.achievements.loading")} />
      )}
      <div>
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
