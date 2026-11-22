import { useState } from "react";
import { Group, Stack, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconChevronRight } from "@tabler/icons-react";
import { useUserId } from "../../auth";
import { CenteredErrorMessage, CenteredLoading } from "../../general";
import {
  FeaturedFeatOptimisticProvider,
  useAchievementProgress,
  useAchievementsV2,
  useAllObtainedAchievements,
  useOptimisticFeaturedAchievementId,
} from "../hooks";
import { buildFeatsModel, filterFeats, type FeatItem } from "../util/feats";
import { FeatFeaturedPicker } from "./FeatFeaturedPicker";
import { FeatTiersModal } from "./FeatTiersModal";
import { FeatsAlmostThere } from "./FeatsAlmostThere";
import { FeatsEvents } from "./FeatsEvents";
import { FeatsFilters, type FeatsFiltersValue } from "./FeatsFilters";
import { FeatsHeader } from "./FeatsHeader";
import { FeatsPastEventsModal } from "./FeatsPastEventsModal";
import { FeatsProfileCard } from "./FeatsProfileCard";
import { FeatsSection } from "./FeatsSection";
import { FeatsSummaryCard } from "./FeatsSummaryCard";
import { RedeemFeatCodeModal } from "./RedeemFeatCodeModal";

export interface FeatsScreenProps {
  targetUserId: string;
  /** Hides the profile card when the page is embedded in the profile (default true). */
  withUserLevel?: boolean;
}

const DEFAULT_FILTERS: FeatsFiltersValue = {
  category: "all",
  query: "",
  status: "all",
};

/**
 * Feats page shared by the web route and the native app. The profile and
 * summary cards share a 55/45 row on desktop and stack on narrow screens.
 */
const FeatsScreenContent = ({
  targetUserId,
  withUserLevel = true,
}: FeatsScreenProps) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const achievementsQuery = useAchievementsV2(targetUserId);
  const progressQuery = useAchievementProgress(targetUserId);
  const featuredQuery = useAllObtainedAchievements(targetUserId, true);
  const [now] = useState(Date.now);
  const [filters, setFilters] = useState<FeatsFiltersValue>(DEFAULT_FILTERS);
  const [tiersAchievementId, setTiersAchievementId] = useState<string | null>(
    null,
  );
  const [tiersOpened, tiersModal] = useDisclosure(false);
  const [featuredOpened, featuredModal] = useDisclosure(false);
  const [redeemOpened, redeemModal] = useDisclosure(false);
  const [pastEventsOpened, pastEventsModal] = useDisclosure(false);

  const isOwner = userId != undefined && userId === targetUserId;

  const model = buildFeatsModel({
    achievements: achievementsQuery.data ?? [],
    progress: progressQuery.data ?? [],
    now,
  });

  const filteredItems = filterFeats(model.items, filters);

  const obtainedItems = filteredItems.filter(
    (item) => (item.progress?.tier ?? 0) > 0,
  );
  const notObtainedItems = filteredItems.filter(
    (item) => (item.progress?.tier ?? 0) <= 0,
  );
  const featureableItems = model.items.filter(
    (item) => (item.progress?.tier ?? 0) > 0,
  );

  const pendingFeaturedAchievementId = useOptimisticFeaturedAchievementId();
  const featuredObtained = featuredQuery.data?.find((item) => item.isFeatured);
  const featuredAchievementId =
    pendingFeaturedAchievementId ?? featuredObtained?.achievementId ?? null;
  const featuredItem =
    featuredAchievementId != null
      ? (model.items.find(
          (item) => item.achievement.id === featuredAchievementId,
        ) ?? null)
      : null;

  // The modal reads the item from the current model, so a refetch after
  // featuring or redeeming updates it instead of showing a stale snapshot.
  const tiersItem =
    tiersAchievementId != null
      ? (model.items.find(
          (item) => item.achievement.id === tiersAchievementId,
        ) ?? null)
      : null;

  const openTiers = (item: FeatItem) => {
    setTiersAchievementId(item.achievement.id);
    tiersModal.open();
  };

  const visibleEventRows = model.events.filter(
    (group) => !group.isPast || group.obtainedCount > 0,
  );
  const hasOnlyPastEvents =
    visibleEventRows.length === 0 && model.pastEvents.length > 0;

  if (!targetUserId) return null;

  const isLoading = achievementsQuery.isLoading || progressQuery.isLoading;
  const error = achievementsQuery.error || progressQuery.error;

  const summaryCard = (
    <FeatsSummaryCard
      summary={model.summary}
      featuredItem={featuredItem}
      isOwner={isOwner}
      onPickFeatured={featuredModal.open}
      onRedeem={redeemModal.open}
    />
  );

  return (
    <Stack w={"100%"} gap={24}>
      <FeatsHeader userId={targetUserId} />

      {error && <CenteredErrorMessage error={error} />}
      {isLoading && <CenteredLoading />}

      {!isLoading && !error && (
        <>
          {withUserLevel ? (
            <div
              className={
                "grid items-stretch gap-4 lg:grid-cols-[minmax(0,55fr)_minmax(0,45fr)]"
              }
            >
              <FeatsProfileCard userId={targetUserId} />
              {summaryCard}
            </div>
          ) : (
            summaryCard
          )}

          <FeatsAlmostThere items={model.almostThere} onOpenTiers={openTiers} />

          {hasOnlyPastEvents && (
            <Group justify={"flex-end"} gap={0}>
              <UnstyledButton
                onClick={pastEventsModal.open}
                className={
                  "flex shrink-0 items-center gap-1.5 text-sm text-bright hover:text-foreground"
                }
              >
                {t("achievements.events.pastEvents")}
                <IconChevronRight size={18} />
              </UnstyledButton>
            </Group>
          )}

          <FeatsEvents
            events={model.events}
            pastEvents={model.pastEvents}
            onOpenPastEvents={pastEventsModal.open}
          />

          <FeatsFilters
            category={filters.category}
            query={filters.query}
            status={filters.status}
            total={model.summary.total}
            onChange={setFilters}
          />

          {filteredItems.length === 0 ? (
            <FeatsSection
              kind={"notObtained"}
              items={[]}
              onOpenTiers={openTiers}
              showEmptyState
            />
          ) : (
            <>
              <FeatsSection
                kind={"obtained"}
                items={obtainedItems}
                onOpenTiers={openTiers}
              />
              <FeatsSection
                kind={"notObtained"}
                items={notObtainedItems}
                onOpenTiers={openTiers}
              />
            </>
          )}
        </>
      )}

      <FeatTiersModal
        opened={tiersOpened}
        onClose={tiersModal.close}
        item={tiersItem}
        targetUserId={targetUserId}
        isOwner={isOwner}
      />

      {isOwner && (
        <>
          <FeatFeaturedPicker
            opened={featuredOpened}
            onClose={featuredModal.close}
            targetUserId={targetUserId}
            items={featureableItems}
            featuredAchievementId={featuredAchievementId}
          />
          <RedeemFeatCodeModal
            opened={redeemOpened}
            onClose={redeemModal.close}
            targetUserId={targetUserId}
          />
        </>
      )}

      <FeatsPastEventsModal
        opened={pastEventsOpened}
        onClose={pastEventsModal.close}
        pastEvents={model.pastEvents}
      />
    </Stack>
  );
};

/**
 * Keeps the pending featured feat shared by the summary slot, the picker, the
 * tier details and the redeem reveal.
 */
const FeatsScreen = (props: FeatsScreenProps) => (
  <FeaturedFeatOptimisticProvider key={props.targetUserId}>
    <FeatsScreenContent {...props} />
  </FeaturedFeatOptimisticProvider>
);

export { FeatsScreen };
