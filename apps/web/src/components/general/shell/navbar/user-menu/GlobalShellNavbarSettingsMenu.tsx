import { GlobalShellNavbarUserMenuItem } from "@/components/general/shell/navbar/user-menu/GlobalShellNavbarUserMenuItem";
import { GlobalShellUserMenuOverview } from "@/components/general/shell/navbar/user-menu/GlobalShellUserMenuOverview";
import { Avatar, Menu, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { UserAvatar, useSettingsModalState, useUserId } from "@repo/ui";
import { IconDownload, IconLogout, IconSettings } from "@tabler/icons-react";

export const GAMENODE_ANDROID_URL =
  "https://play.google.com/store/apps/details?id=app.gamenode";

/**
 * Avatar menu at the bottom of the sidebar (default GameNode layout).
 * Language and bug reports moved to the settings modal it opens.
 */
const GlobalShellNavbarSettingsMenu = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  const settings = useSettingsModalState();

  if (!userId) {
    return <Avatar />;
  }

  return (
    <Menu
      position={"right-end"}
      keepMounted={true}
      withinPortal={true}
      offset={15}
    >
      <Menu.Target>
        <UnstyledButton aria-label={t("settings.userMenu.settings")}>
          <UserAvatar userId={userId} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown
        className={
          "px-2 bg-paper-7 border-[#2a2a2a] min-w-56 gap-1 flex flex-col"
        }
      >
        <GlobalShellUserMenuOverview userId={userId} />
        <GlobalShellNavbarUserMenuItem
          label={t("settings.userMenu.settings")}
          href={""}
          Icon={IconSettings}
          onClick={(evt) => {
            evt.preventDefault();
            settings.open("profile");
          }}
        />
        <GlobalShellNavbarUserMenuItem
          label={t("settings.userMenu.downloads")}
          href={GAMENODE_ANDROID_URL}
          Icon={IconDownload}
        />
        <Menu.Divider />
        <GlobalShellNavbarUserMenuItem
          label={t("settings.userMenu.logout")}
          href={"/auth/logout"}
          color={"#DDA4A4"}
          Icon={IconLogout}
        />
      </Menu.Dropdown>
    </Menu>
  );
};

export { GlobalShellNavbarSettingsMenu };
