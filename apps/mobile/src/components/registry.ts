import { buildPresenterRegistry } from "@repo/ui";
import { MobileActivityItem } from "@/components/activity/MobileActivityItem.tsx";
import { MobileGameInfoTitleFigure } from "@/components/game/info/MobileGameInfoTitleFigure.tsx";
import { MobileGameInfoActions } from "@/components/game/info/MobileGameInfoActions.tsx";
import { MobileDetailsBox } from "@/components/general/MobileDetailsBox.tsx";

export const UI_PRESENTER_REGISTRY = buildPresenterRegistry({
  ActivityItem: MobileActivityItem,
  GameInfoTitleFigure: MobileGameInfoTitleFigure,
  GameInfoActions: MobileGameInfoActions,
  DetailsBox: MobileDetailsBox,
});
