import { GlobalShellNavbarUserMenuItem } from "@/components/general/shell/navbar/user-menu/GlobalShellNavbarUserMenuItem";
import { GlobalShellUserMenuOverview } from "@/components/general/shell/navbar/user-menu/GlobalShellUserMenuOverview";
import { Avatar, Menu, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { LanguageSwitcherMenu, UserAvatar, useUserId } from "@repo/ui";
import { IconBug, IconLogout, IconSettings } from "@tabler/icons-react";

interface Props {
  /** Console header: the target shows avatar, name and level, and the menu opens downwards. */
  withDetails?: boolean;
}

const GlobalShellNavbarUserMenu = ({ withDetails = false }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();

  if (!userId) {
    return <Avatar />;
  }

  return (
    <Menu
      position={withDetails ? "bottom-start" : "right-start"}
      keepMounted={true}
      withinPortal={false}
      offset={15}
    >
      <Menu.Target>
        <UnstyledButton>
          {withDetails ? (
            <GlobalShellUserMenuOverview userId={userId} withLink={false} />
          ) : (
            <UserAvatar userId={userId} />
          )}
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