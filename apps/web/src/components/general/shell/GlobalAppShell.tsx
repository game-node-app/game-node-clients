import React from "react";
import { AppShell, Container, useMantineTheme } from "@mantine/core";
import GlobalShellHeader from "@/components/general/shell/header/GlobalShellHeader";
import { useDisclosure, useLocalStorage, useMediaQuery } from "@mantine/hooks";
import GlobalShellFooter from "@/components/general/shell/GlobalShellFooter";
import { Dock } from "@/components/general/shell/navbar/Dock";
import { useRouter } from "next/router";
import { cn, SettingsModal, useAppExperience } from "@repo/ui";
import dynamic from "next/dynamic";

/**
 * Console shell pieces are their own chunks: `gamenode` never imports them, so
 * their CSS Modules and components are absent from its network log. The
 * console header/nav modules are only rendered when the active experience is
 * `console`.
 */
const GlobalShellConsoleHeader = dynamic(
  () => import("@/components/general/shell/header/GlobalShellConsoleHeader"),
);
const GlobalShellConsoleBottomNav = dynamic(
  () => import("@/components/general/shell/navbar/GlobalShellConsoleBottomNav"),
);

const IGNORED_PATHNAMES = [
  "/",
  "/about",
  "/premium",
  "/awards",
  "/auth",
  "/oauth/consent",
];

const DEFAULT_HEADER_HEIGHT = 56;
const CONSOLE_HEADER_HEIGHT = 64;
const DOCK_GUTTER = 16;

/**
 * https://mantine.dev/core/app-shell/
 * @param children - The main content of the page
 * @constructor
 */
const GlobalAppShell = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useRouter();
  const theme = useMantineTheme();
  const experience = useAppExperience();
  const isConsole = experience === "console";
  const [sidebarOpened, sidebarOpenedUtils] = useDisclosure(false);
  const [dockCollapsed, setDockCollapsed] = useLocalStorage<boolean>({
    key: "gamenode.dock.collapsed",
    defaultValue: false,
    // The Dock is rendered open on the server; the stored preference is
    // applied after mount to avoid a hydration mismatch (design §3).
    getInitialValueInEffect: true,
  });
  const isDesktop = useMediaQuery(
    `(min-width: ${theme.breakpoints.md})`,
    false,
  );

  if (IGNORED_PATHNAMES.includes(pathname)) {
    return children;
  }

  // Below `md` the drawer always shows labels, regardless of the desktop
  // preference.
  const collapsed = isDesktop && dockCollapsed;

  return (
    <AppShell
      header={{
        height: isConsole ? CONSOLE_HEADER_HEIGHT : DEFAULT_HEADER_HEIGHT,
      }}
      footer={{ height: 60, offset: false }}
      navbar={
        isConsole
          ? undefined
          : {
              width: { base: 280, md: dockCollapsed ? 104 : 280 },
              breakpoint: "md",
              collapsed: { mobile: !sidebarOpened },
            }
      }
      padding={DOCK_GUTTER}
      withBorder={false}
      transitionDuration={150}
      className={
        isConsole
          ? "pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0"
          : undefined
      }
      classNames={{
        header: "bg-transparent",
        navbar:
          "bg-transparent [@media(max-width:61.99375em)]:!w-[280px] md:transition-[width] md:ease-in-out",
        main: isConsole
          ? "transition-[padding-inline-start] min-w-0"
          : "transition-[padding-inline-start]",
      }}
    >
      <AppShell.Header>
        {isConsole ? (
          <GlobalShellConsoleHeader />
        ) : (
          <GlobalShellHeader
            sidebarOpened={sidebarOpened}
            toggleSidebar={sidebarOpenedUtils.toggle}
          />
        )}
      </AppShell.Header>
      {!isConsole && (
        <AppShell.Navbar>
          <div className="h-full p-4">
            <div className={"sticky top-4 h-[calc(100dvh-56px-32px)]"}>
              <Dock
                collapsed={collapsed}
                onToggleCollapsed={() =>
                  setDockCollapsed((current) => !current)
                }
                onNavigate={sidebarOpenedUtils.close}
              />
            </div>
          </div>
        </AppShell.Navbar>
      )}
      {!isConsole && sidebarOpened && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[99] bg-black/40 md:hidden"
          onClick={sidebarOpenedUtils.close}
        />
      )}
      <AppShell.Main
        className={cn(
          isConsole && "overflow-x-clip",
          isConsole && pathname === "/home" && "[container-type:inline-size]",
        )}
      >
        <Container fluid className={"max-w-screen-xl"}>
          {children}
        </Container>
      </AppShell.Main>
      {isConsole && <GlobalShellConsoleBottomNav />}
      <AppShell.Footer
        pos={"static"}
        data-xbox-focus-scope={isConsole ? "true" : undefined}
      >
        <GlobalShellFooter />
      </AppShell.Footer>
      <SettingsModal />
    </AppShell>
  );
};

export default GlobalAppShell;
