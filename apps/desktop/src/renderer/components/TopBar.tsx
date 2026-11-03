import { Avatar, Menu, UnstyledButton } from "@mantine/core";
import { IconLogout, IconMenu2, IconPlug } from "@tabler/icons-react";

export interface TopBarUser {
  name: string;
}

// Occupies the (hidden) title bar: draggable, OS window controls are drawn over the reserved right padding.
export function TopBar({
  user,
  onError,
}: {
  user?: TopBarUser;
  onError?: (message: string) => void;
}) {
  return (
    <header
      className="app-drag flex h-12 shrink-0 items-center gap-md bg-paper-1 pl-sm"
      style={{
        paddingRight: "calc(100vw - env(titlebar-area-width, 100vw) + 8px)",
      }}
    >
      {user && (
        <UnstyledButton
          aria-label="Application menu"
          className="no-drag flex size-8 items-center justify-center rounded-sm hover:bg-paper-4"
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            void window.gamenode
              .showAppMenu(box.left, box.bottom)
              .catch(() => onError?.("Could not show application menu"));
          }}
        >
          <IconMenu2 size={20} />
        </UnstyledButton>
      )}
      <img src="/img/main-logo.png" alt="GameNode" className="h-6" />
      {user && (
        <>
          <nav className="flex h-full items-stretch">
            <span
              aria-current="page"
              className="flex items-center border-b-2 border-brand px-sm text-sm font-medium"
            >
              Library
            </span>
          </nav>
          <div className="no-drag ml-auto">
            <Menu position="bottom-end" width={220}>
              <Menu.Target>
                <UnstyledButton aria-label="User menu" className="rounded-full">
                  <Avatar size="sm" color="brand" name={user.name} />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>{user.name}</Menu.Label>
                <Menu.Item
                  leftSection={<IconPlug size={16} />}
                  onClick={() =>
                    void window.gamenode
                      .openExternal(
                        "https://gamenode.app/preferences/connections",
                      )
                      .catch(() => onError?.("Could not open connections"))
                  }
                >
                  Manage stores
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLogout size={16} />}
                  onClick={() =>
                    void window.gamenode
                      .signOut()
                      .catch(() => onError?.("Could not clear saved session"))
                  }
                >
                  Sign out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </>
      )}
    </header>
  );
}
