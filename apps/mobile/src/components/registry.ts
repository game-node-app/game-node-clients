import { Browser } from "@capacitor/browser";
import { Share } from "@capacitor/share";
import { UIHookRegistry, UIPresenterRegistry } from "@repo/ui";
import { MobileGameInfoTitleFigure } from "@/components/game/info/MobileGameInfoTitleFigure.tsx";
import { MobileGameInfoActions } from "@/components/game/info/MobileGameInfoActions.tsx";
import { MobileDetailsBox } from "@/components/general/MobileDetailsBox.tsx";
import { MobileTrendingReviewCard } from "@/components/review/trending/MobileTrendingReviewCard.tsx";
import { MobileCollectionThumbnailCard } from "@/components/collection/MobileCollectionThumbnailCard.tsx";
import { MobileGameAchievementListItem } from "@/components/achievement/MobileGameAchievementListItem.tsx";
import { LinkWrapper } from "@/components/general/LinkWrapper";
import { useIonRouterWrapper } from "@/components/general/hooks/useIonRouterWrapper";
import { IonModalWrapper } from "@/components/general/IonModalWrapper";
import { MobileProfileUserInfo } from "@/components/profile/view/MobileProfileUserInfo.tsx";
import { MobileProfileViewNavbarItem } from "@/components/profile/view/navbar/MobileProfileViewNavbarItem.tsx";
import { useIonScrollPosition } from "@/components/general/hooks/useIonScrollPosition";
import { useIonViewActive } from "@/components/general/hooks/useIonViewActive";

export const UI_PRESENTER_REGISTRY: Partial<UIPresenterRegistry> = {
  GameInfoTitleFigure: MobileGameInfoTitleFigure,
  GameInfoActions: MobileGameInfoActions,
  DetailsBox: MobileDetailsBox,
  TrendingReviewCard: MobileTrendingReviewCard,
  CollectionThumbnailCard: MobileCollectionThumbnailCard,
  GameAchievementsListItem: MobileGameAchievementListItem,
  Link: LinkWrapper,
  Modal: IonModalWrapper,
  ProfileUserInfo: MobileProfileUserInfo,
  ProfileViewNavbarItem: MobileProfileViewNavbarItem,
};

export const UI_HOOK_REGISTRY: UIHookRegistry = {
  useRouter: useIonRouterWrapper,
  authPath: "/m/auth",
  supporterSettingsHref: "/preferences/supporter",
  useScrollPosition: useIonScrollPosition,
  useIsViewActive: useIonViewActive,
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
  openExternalUrl: async (url) => {
    await Browser.open({ url });
  },
};
