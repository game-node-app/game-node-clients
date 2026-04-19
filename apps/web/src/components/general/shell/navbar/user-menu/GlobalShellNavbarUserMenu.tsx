import React from "react";
import {
  LanguageSwitcherMenu,
  UserAvatar,
  UserAvatarWithLevelInfo,
  useUserId,
} from "@repo/ui";
import { Avatar, Center, Menu, Stack, UnstyledButton } from "@mantine/core";
import { GlobalShellNavbarUserMenuItem } from "@/components/general/shell/navbar/user-menu/GlobalShellNavbarUserMenuItem";
import { IconBug, IconLogout, IconSettings } from "@tabler/icons-react";
import { GlobalShellUserMenuOverview } from "@/components/general/shell/navbar/user-menu/GlobalShellUserMenuOverview";
import { useTranslation } from "@repo/locales";

const GlobalShellNavbarUserMenu = () => {
  const { t } = useTranslation();
  const userId = useUserId();

  if (!userId) {
    return <Avatar />;
  }

  return (
    <Menu
      position={"right-start"}
      keepMounted={true}
      withinPortal={false}
      offset={15}
    >
      <Menu.Target>
        <UnstyledButton>
          <UserAvatar userId={userId} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown className={"px-2 bg-paper-7 min-w-56 gap-1 flex flex-col"}>
        <GlobalShellUserMenuOverview userId={userId} />
        <LanguageSwitcherMenu />
        <GlobalShellNavbarUserMenuItem
          label={t("navigation.preferences")}
          href={"/preferences"}
          Icon={IconSettings}
        />
        <Menu.Divider />
        <GlobalShellNavbarUserMenuItem
          label={t("preferences.links.reportBug")}
          href={"https://github.com/game-node-app/game-node-clients/issues/new"}
          Icon={IconBug}
        />
        <GlobalShellNavbarUserMenuItem
          label={t("actions.logout")}
          href={"/auth/logout"}
          color={"#DDA4A4"}
          Icon={IconLogout}
        />
      </Menu.Dropdown>
    </Menu>
  );
};

export { GlobalShellNavbarUserMenu };
