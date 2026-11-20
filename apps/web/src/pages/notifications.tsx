import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  buildPresenterComponent,
  NotificationsPanel,
  SessionAuth,
  useAppThemeScreens,
  useSettingsModalState,
} from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";
import dynamic from "next/dynamic";

const NotificationsPanelPresenter = buildPresenterComponent(
  "NotificationsPanel",
  NotificationsPanel,
);

/** Loaded only when the Xbox screens are active (see 7.8). */
const XboxNotificationsSkin = dynamic(
  () => import("@/components/general/shell/header/XboxNotificationsSkin"),
);

/**
 * Authenticated notifications page (design: NotificationsPanel page variant).
 * The shared panel keeps the header, tabs, grouped list and pagination of the
 * Topbar popover, at a maximum width of 640 px.
 */
const NotificationsPage = () => {
  const { t } = useTranslation();
  const settings = useSettingsModalState();
  const screens = useAppThemeScreens();

  const panel = (
    <NotificationsPanelPresenter
      variant={"page"}
      onOpenSettings={() => settings.open("notifications")}
    />
  );

  return (
    <>
      <OpenGraph title={`${t("notifications.title")} - GameNode`} noIndex />
      <SessionAuth>
        <Box className={"w-full py-4"}>
          {screens === "xbox" ? (
            <XboxNotificationsSkin variant={"page"}>
              {panel}
            </XboxNotificationsSkin>
          ) : (
            panel
          )}
        </Box>
      </SessionAuth>
    </>
  );
};

export default NotificationsPage;
