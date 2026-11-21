import { AppPage } from "@/components/general/AppPage";
import { SignedOutTabPlaceholder } from "@/components/general/SignedOutTabPlaceholder";
import { useTranslation } from "@repo/locales";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import {
  buildPresenterComponent,
  NotificationsPanel,
  useSettingsModalState,
} from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";

const NotificationsPanelPresenter = buildPresenterComponent(
  "NotificationsPanel",
  NotificationsPanel,
);

/**
 * Mobile notifications page, sharing the panel used by the web popover and
 * page. The pull-to-refresh keeps the previous `["notifications"]` prefix
 * invalidation and completes the Ionic gesture when the requests settle.
 */
const NotificationsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const settings = useSettingsModalState();

  return (
    <AppPage
      title={t("notifications.title")}
      contentProps={{
        fixedSlotPlacement: "before",
      }}
      withMenuButton
    >
      <IonRefresher
        slot={"fixed"}
        onIonRefresh={async (evt) => {
          await queryClient.invalidateQueries({
            queryKey: ["notifications"],
          });

          evt.detail.complete();
        }}
      >
        <IonRefresherContent />
      </IonRefresher>
      <SignedOutTabPlaceholder screen={"notifications"}>
        <div className={"w-full pb-4"}>
          <NotificationsPanelPresenter
            variant={"page"}
            onOpenSettings={() => settings.open("notifications")}
          />
        </div>
      </SignedOutTabPlaceholder>
    </AppPage>
  );
};

export default NotificationsPage;
