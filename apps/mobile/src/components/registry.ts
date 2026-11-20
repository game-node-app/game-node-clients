import { Browser } from "@capacitor/browser";
import { Share } from "@capacitor/share";
import { UIHookRegistry, UIPresenterRegistry } from "@repo/ui";
import { shareGeneratedFile } from "@/util/shareGeneratedFile";
import { MobileGameInfoTitleFigure } from "@/components/game/info/MobileGameInfoTitleFigure.tsx";
import { MobileDetailsBox } from "@/components/general/MobileDetailsBox.tsx";
import { MobileTrendingReviewCard } from "@/components/review/trending/MobileTrendingReviewCard.tsx";
import { MobileCollectionThumbnailCard } from "@/components/collection/MobileCollectionThumbnailCard.tsx";
import { MobileGameAchievementListItem } from "@/components/achievement/MobileGameAchievementListItem.tsx";
import { MobileUserLevelHeader } from "@/components/general/MobileUserLevelHeader";
import { MobileJournalAchievementsGameGroup } from "@/components/journal/MobileJournalAchievementsGameGroup";
import { MobileProfileStatsView } from "@/components/profile/MobileProfileStatsView";
import { MobileBlogArticleLanguageLink } from "@/components/blog/MobileBlogArticleLanguageLink";
import { MobileMcpGuideScreen } from "@/components/mcp/MobileMcpGuideScreen";
import { MobilePostsFeedLayout } from "@/components/posts/MobilePostsFeedLayout";
import { MobilePostsListItem } from "@/components/posts/MobilePostsListItem";
import {
  MobileJournalMonthHeader,
  MobileJournalYearHeader,
} from "@/components/journal/MobileJournalHeaders";
import { MobileJournalOverviewItem } from "@/components/journal/MobileJournalOverviewItem";
import { MobileProfileReviewListEmpty } from "@/components/review/list/MobileProfileReviewListEmpty";
import { MobileProfileReviewListItem } from "@/components/review/list/MobileProfileReviewListItem";
import { LinkWrapper } from "@/components/general/LinkWrapper";
import { useIonRouterWrapper } from "@/components/general/hooks/useIonRouterWrapper";
import { IonModalWrapper } from "@/components/general/IonModalWrapper";
import { useIonScrollPosition } from "@/components/general/hooks/useIonScrollPosition";
import { useIonViewActive } from "@/components/general/hooks/useIonViewActive";
import { useOpenGameSearch } from "@/components/general/hooks/useOpenGameSearch";

export const UI_PRESENTER_REGISTRY: Partial<UIPresenterRegistry> = {
  GameInfoTitleFigure: MobileGameInfoTitleFigure,
  DetailsBox: MobileDetailsBox,
  TrendingReviewCard: MobileTrendingReviewCard,
  CollectionThumbnailCard: MobileCollectionThumbnailCard,
  GameAchievementsListItem: MobileGameAchievementListItem,
  BlogArticleLanguageLink: MobileBlogArticleLanguageLink,
  McpGuideScreen: MobileMcpGuideScreen,
  PostsFeedLayout: MobilePostsFeedLayout,
  PostsListItem: MobilePostsListItem,
  UserLevelHeader: MobileUserLevelHeader,
  JournalAchievementsGameGroup: MobileJournalAchievementsGameGroup,
  ProfileStatsView: MobileProfileStatsView,
  JournalOverviewItem: MobileJournalOverviewItem,
  JournalMonthHeader: MobileJournalMonthHeader,
  JournalYearHeader: MobileJournalYearHeader,
  ProfileReviewListItem: MobileProfileReviewListItem,
  ProfileReviewListEmpty: MobileProfileReviewListEmpty,
  Link: LinkWrapper,
  Modal: IonModalWrapper,
};

export const UI_HOOK_REGISTRY: UIHookRegistry = {
  useRouter: useIonRouterWrapper,
  authPath: "/m/auth",
  supporterSettingsHref: "/preferences/supporter",
  useScrollPosition: useIonScrollPosition,
  useIsViewActive: useIonViewActive,
  useOpenGameSearch,
  shareText: async (text) => {
    try {
      await Share.share({ text });
      return true;
    } catch (error) {
      // the plugin rejects when the share sheet is dismissed
      if (/cancel/i.test((error as Error).message ?? "")) return false;
      throw error;
    }
  },
  shareFile: shareGeneratedFile,
  openExternalUrl: async (url) => {
    await Browser.open({ url });
  },
};
