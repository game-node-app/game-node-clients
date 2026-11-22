import { RecentActivityList } from "#@/components/activity/RecentActivityList";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { JournalHeatmap } from "#@/components/journal/heatmap/view/JournalHeatmap";
import { useIsLibraryHidden } from "#@/components/library/hooks/useIsLibraryHidden";
import { LibraryHiddenState } from "#@/components/library/view/LibraryHiddenState";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileReviewListItem } from "#@/components/profile/review/ProfileReviewListItem";
import { ProfileAchievementHighlights } from "#@/components/profile/view/ProfileAchievementHighlights";
import { ProfileFavoriteGames } from "#@/components/profile/view/ProfileFavoriteGames";
import { ProfileFooter } from "#@/components/profile/view/ProfileFooter";
import type { ProfileTab } from "#@/components/profile/view/ProfileViewContent";
import type { useReviewsForUserId } from "#@/components/review/hooks/useReviewsForUserId";
import {
  Box,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
  reviews: ReturnType<typeof useReviewsForUserId>;
  onNavigate: (tab: ProfileTab) => void;
}

const TEXT_LINK =
  "self-start text-sm text-[var(--profile-accent-text,var(--mantine-color-brand-filled))] hover:underline";
const TAB_STYLE =
  "border-b-2 border-transparent px-1 py-2 text-sm text-dimmed data-[active]:border-[var(--profile-accent,var(--mantine-color-brand-filled))] data-[active]:font-semibold data-[active]:text-foreground";

const ProfileViewMainPage = ({ userId, reviews, onNavigate }: Props) => {
  const { t } = useTranslation();
  const { data: profile } = useUserProfile(userId);
  const { isHidden } = useIsLibraryHidden(userId, profile);
  const ownUserId = useUserId();

  return (
    <Stack gap="xl" className="min-w-0">
      {isHidden ? (
        <LibraryHiddenState profile={profile} />
      ) : (
        <>
          <ProfileFavoriteGames userId={userId} />
          <Stack gap="xs">
            <JournalHeatmap userId={userId} />
            <Group gap="md" justify="flex-end">
              <UnstyledButton
                className={TEXT_LINK}
                onClick={() => onNavigate("journal")}
              >
                {t("profile.tabs.journal")}
              </UnstyledButton>
              <UnstyledButton
                className={TEXT_LINK}
                onClick={() => onNavigate("stats")}
              >
                {t("profile.labels.stats")}
              </UnstyledButton>
            </Group>
          </Stack>
        </>
      )}

      <Box className="grid items-start gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Tabs
          key={String(isHidden)}
          defaultValue="reviews"
          keepMounted={false}
          unstyled
          className="min-w-0"
        >
          <Tabs.List
            aria-label={t("profile.overview.highlights")}
            className="mb-4 flex flex-wrap gap-5"
          >
            <Tabs.Tab value="reviews" className={TAB_STYLE}>
              {t("profile.tabs.reviews")}
            </Tabs.Tab>
            {!isHidden && (
              <Tabs.Tab value="activity" className={TAB_STYLE}>
                {t("profile.overview.activity")}
              </Tabs.Tab>
            )}
          </Tabs.List>
          <Tabs.Panel value="reviews">
            <Stack gap="md">
              {reviews.isLoading && <CenteredLoading />}
              {reviews.isError && (
                <Text size="sm" c="dimmed">
                  {t("profile.messages.fetchFailed")}
                </Text>
              )}
              {reviews.isSuccess && !reviews.data?.data.length && (
                <Text size="sm" c="dimmed">
                  {t(
                    ownUserId === userId
                      ? "profile.messages.noReviewsOwn"
                      : "profile.messages.noReviews",
                  )}
                </Text>
              )}
              {!!reviews.data?.data.length && (
                <>
                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {reviews.data.data.map((review) => (
                      <ProfileReviewListItem
                        key={review.id}
                        review={review}
                        preview
                      />
                    ))}
                  </SimpleGrid>
                  <UnstyledButton
                    className={TEXT_LINK}
                    onClick={() => onNavigate("reviews")}
                  >
                    {t("profile.overview.allReviews")}
                  </UnstyledButton>
                </>
              )}
            </Stack>
          </Tabs.Panel>
          {!isHidden && (
            <Tabs.Panel value="activity">
              <RecentActivityList
                userId={userId}
                withUserAvatar
                limit={10}
                variant="card"
              />
            </Tabs.Panel>
          )}
        </Tabs>
        <ProfileAchievementHighlights
          userId={userId}
          showGameAchievements={!isHidden}
          onGameAchievements={() => onNavigate("achievements")}
          onFeats={() => onNavigate("feats")}
        />
      </Box>

      {profile && <ProfileFooter profile={profile} />}
    </Stack>
  );
};

export { ProfileViewMainPage };
