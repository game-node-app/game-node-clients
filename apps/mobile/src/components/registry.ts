import { buildPresenterRegistry } from "@repo/ui";
import { MobileActivityItem } from "@/components/activity/MobileActivityItem.tsx";
import { MobileGameInfoTitleFigure } from "@/components/game/info/MobileGameInfoTitleFigure.tsx";
import { MobileGameInfoActions } from "@/components/game/info/MobileGameInfoActions.tsx";
import { MobileDetailsBox } from "@/components/general/MobileDetailsBox.tsx";
import { MobileTrendingReviewCard } from "@/components/review/trending/MobileTrendingReviewCard.tsx";
import { MobileCollectionThumbnailCard } from "@/components/collection/MobileCollectionThumbnailCard.tsx";
import { MobileGameAchievementListItem } from "@/components/achievement/MobileGameAchievementListItem.tsx";

export const UI_PRESENTER_REGISTRY = buildPresenterRegistry({
  ActivityItem: MobileActivityItem,
  GameInfoTitleFigure: MobileGameInfoTitleFigure,
  GameInfoActions: MobileGameInfoActions,
  DetailsBox: MobileDetailsBox,
  TrendingReviewCard: MobileTrendingReviewCard,
  CollectionThumbnailCard: MobileCollectionThumbnailCard,
  GameAchievementsListItem: MobileGameAchievementListItem,
});
