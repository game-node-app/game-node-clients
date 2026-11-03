import React from "react";
import { AppShell, Box, Container } from "@mantine/core";
import GlobalShellHeader from "@/components/general/shell/header/GlobalShellHeader";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import GlobalShellConsoleHeader from "@/components/general/shell/header/GlobalShellConsoleHeader";
import GlobalShellFooter from "@/components/general/shell/GlobalShellFooter";
import GlobalShellNavbar from "@/components/general/shell/navbar/GlobalShellNavbar";
import { useRouter } from "next/router";
import { THEMES, useAppTheme } from "@repo/ui";

const IGNORED_PATHNAMES = ["/", "/about", "/awards", "/auth", "/oauth/consent"];

/**
 * https://mantine.dev/core/app-shell/
 * @param children - The main content of the page
 * @constructor
 */
const GlobalAppShell = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useRouter();
  const [sidebarOpened, sidebarOpenedUtils] = useDisclosure(false);
  const [theme] = useAppTheme();
  const isConsole = THEMES[theme].layout === "console";
  // console headers can be see-through over the home art until the page scrolls
  const [scroll] = useWindowScroll();

  const navbar = (horizontal: boolean) => (
    <GlobalShellNavbar
      horizontal={horizontal}
      isOpen={sidebarOpened}
      onOpen={sidebarOpenedUtils.open}
      onClose={sidebarOpenedUtils.close}
    />
  );

  if (IGNORED_PATHNAMES.includes(pathname)) {
    return children;
  }

  return (
    <AppShell
      header={{
        // console headers carry the profile (avatar, name and level)
        height: isConsole ? 72 : 54,
      }}
      footer={{ height: 60, offset: false }}
      navbar={{
        breakpoint: "md",
        width: 64,
        collapsed: { mobile: !sidebarOpened, desktop: isConsole },
      }}
      className={isConsole ? "overflow-hidden gn-console-shell" : "overflow-hidden"}
      classNames={{
        navbar: "max-w-20",
      }}
    >
      <AppShell.Header
        className={isConsole ? "gn-console-header" : undefined}
        data-scrolled={scroll.y > 24 || undefined}
      >
        {isConsole ? (
          <GlobalShellConsoleHeader navigation={navbar(true)} />
        ) : (
          <GlobalShellHeader
            sidebarOpened={sidebarOpened}
            toggleSidebar={sidebarOpenedUtils.toggle}
          />
        )}
      </AppShell.Header>
      {!isConsole && <AppShell.Navbar>{navbar(false)}</AppShell.Navbar>}
      <AppShell.Main>
        <Container fluid className={"max-w-screen-xl"}>
          {children}
        </Container>
      </AppShell.Main>
      {isConsole && (
        <Box hiddenFrom="md" className="gn-console-bottom-nav">
          {navbar(true)}
        </Box>
      )}
      <AppShell.Footer pos={"static"}>
        <GlobalShellFooter />
      </AppShell.Footer>
    </AppShell>
  );
};

export default GlobalAppShell;
