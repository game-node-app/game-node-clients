import { TopbarIconButton } from "@/components/general/shell/header/TopbarIconButton";
import { Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import {
  buildPresenterComponent,
  NavBellIcon,
  NotificationsPanel,
  useAppThemeScreens,
  useNotificationsInbox,
  useSettingsModalState,
} from "@repo/ui";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

const MAX_BADGE_COUNT = 99;

const NotificationsPanelPresenter = buildPresenterComponent(
  "NotificationsPanel",
  NotificationsPanel,
);

/**
 * Xbox-only skin for the panel. `useAppThemeScreens()` selects it, and the
 * dynamic import keeps its CSS Module out of the `gamenode` bundle.
 */
const XboxNotificationsSkin = dynamic(
  () => import("@/components/general/shell/header/XboxNotificationsSkin"),
);

/**
 * Topbar/Notification button (design node 5202:2220): bell with the unread
 * count and a 400 × 556 popover hosting the shared `NotificationsPanel`.
 */
const GlobalShellHeaderNotifications = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const settings = useSettingsModalState();
  const screens = useAppThemeScreens();
  const [opened, popoverUtils] = useDisclosure(false);
  const { unreadCount } = useNotificationsInbox({ filter: "all" });

  const hasUnread = unreadCount > 0;
  const badgeCount =
    unreadCount > MAX_BADGE_COUNT ? "99+" : String(unreadCount);
  const label = hasUnread
    ? t("notifications.bellLabel", { count: unreadCount })
    : t("notifications.title");
  const isXbox = screens === "xbox";

  const close = popoverUtils.close;

  const panel = (
    <NotificationsPanelPresenter
      variant={"popover"}
      onSeeAll={() => {
        close();
        void router.push("/notifications");
      }}
      onOpenSettings={() => {
        close();
        settings.open("notifications");
      }}
      onItemNavigate={close}
    />
  );

  return (
    <Popover
      position={"bottom-end"}
      offset={8}
      width={400}
      middlewares={{ shift: { padding: 16 } }}
      withArrow={false}
      shadow={"none"}
      opened={opened}
      onChange={(value) => (value ? popoverUtils.open() : close())}
    >
      <Popover.Target>
        <TopbarIconButton
          label={label}
          active={opened}
          onClick={popoverUtils.toggle}
        >
          <NavBellIcon size={20} />
          {hasUnread && (
            <span
              aria-hidden="true"
              className={
                "absolute left-[23px] top-[3px] flex h-4 items-center justify-center rounded-md border-2 border-nav-surface bg-brand-5 px-1 text-[12px] leading-[normal] text-nav-canvas"
              }
            >
              {badgeCount}
            </span>
          )}
        </TopbarIconButton>
      </Popover.Target>
      <Popover.Dropdown
        className={
          isXbox
            ? "flex h-[556px] max-h-[calc(100dvh-88px)] flex-col border-0 bg-transparent p-0 shadow-none [@media(max-width:431px)]:!w-[calc(100vw-32px)]"
            : "flex h-[556px] flex-col gap-1 rounded-md border border-nav-border bg-nav-surface p-2 [@media(max-width:431px)]:!w-[calc(100vw-32px)]"
        }
      >
        {isXbox ? (
          <XboxNotificationsSkin className={"h-full w-full"}>
            {panel}
          </XboxNotificationsSkin>
        ) : (
          panel
        )}
      </Popover.Dropdown>
    </Popover>
  );
};

export default GlobalShellHeaderNotifications;
