import React from "react";
import { LanguageSwitcherMenu, UserAvatar, useUserId } from "@repo/ui";
import { Avatar, Center, Menu, UnstyledButton } from "@mantine/core";

const GlobalShellNavbarUserMenu = () => {
  const userId = useUserId();

  if (!userId) {
    return <Avatar />;
  }

  return (
    <Menu position={"top-end"} keepMounted={true} withinPortal={false}>
      <Menu.Target>
        <UnstyledButton>
          <UserAvatar userId={userId} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <LanguageSwitcherMenu />
      </Menu.Dropdown>
    </Menu>
  );
};

export { GlobalShellNavbarUserMenu };
