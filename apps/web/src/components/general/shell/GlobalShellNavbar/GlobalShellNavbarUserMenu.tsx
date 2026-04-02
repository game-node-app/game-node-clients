import React from "react";
import { LanguageSwitcher, UserAvatar, useUserId } from "@repo/ui";
import { Avatar, Center, Menu, UnstyledButton } from "@mantine/core";

const GlobalShellNavbarUserMenu = () => {
  const userId = useUserId();

  if (!userId) {
    return <Avatar />;
  }

  return (
    <Menu position={"top-end"}>
      <Menu.Target>
        <UnstyledButton>
          <UserAvatar userId={userId} />
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <LanguageSwitcher />
      </Menu.Dropdown>
    </Menu>
  );
};

export { GlobalShellNavbarUserMenu };
