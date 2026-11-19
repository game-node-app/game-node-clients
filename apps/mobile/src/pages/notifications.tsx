import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { IonRefresher, IonRefresherContent } from "@ionic/react";
import {
  NotificationsPanel,
  SessionAuth,
  useSettingsModalState,
} from "@repo/ui";
import { useQueryClient } from "@tanstack/react-query";

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
      <SessionAuth>
        <div className={"w-full pb-4"}>
          <NotificationsPanel
            variant={"page"}
            onOpenSettings={() => settings.open("notifications")}
          />
        </div>
      </SessionAuth>
    </AppPage>
  );
};

export default NotificationsPage;
