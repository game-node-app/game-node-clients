import { Box } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import {
  NotificationsPanel,
  SessionAuth,
  useSettingsModalState,
} from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";

/**
 * Authenticated notifications page (design: NotificationsPanel page variant).
 * The shared panel keeps the header, tabs, grouped list and pagination of the
 * Topbar popover, at a maximum width of 640 px.
 */
const NotificationsPage = () => {
  const { t } = useTranslation();
  const settings = useSettingsModalState();

  return (
    <>
      <OpenGraph title={`${t("notifications.title")} - GameNode`} noIndex />
      <SessionAuth>
        <Box className={"w-full py-4"}>
          <NotificationsPanel
            variant={"page"}
            onOpenSettings={() => settings.open("notifications")}
          />
        </Box>
      </SessionAuth>
    </>
  );
};

export default NotificationsPage;
