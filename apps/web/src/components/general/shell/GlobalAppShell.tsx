import React from "react";
import { AppShell, Container } from "@mantine/core";
import GlobalShellHeader from "@/components/general/shell/header/GlobalShellHeader";
import { useDisclosure } from "@mantine/hooks";
import GlobalShellFooter from "@/components/general/shell/GlobalShellFooter";
import GlobalShellNavbar from "@/components/general/shell/navbar/GlobalShellNavbar";
import { useRouter } from "next/router";

const IGNORED_PATHNAMES = ["/", "/about", "/awards"];

/**
 * https://mantine.dev/core/app-shell/
 * @param children - The main content of the page
 * @constructor
 */
const GlobalAppShell = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useRouter();
  const [sidebarOpened, sidebarOpenedUtils] = useDisclosure(false);

  if (IGNORED_PATHNAMES.includes(pathname)) {
    return children;
  }

  return (
    <AppShell
      header={{
        height: 54,
      }}
      footer={{ height: 60, offset: false }}
      navbar={{
        breakpoint: "md",
        width: 64,
        collapsed: { mobile: !sidebarOpened },
      }}
      className={"overflow-hidden"}
      classNames={{
        navbar: "max-w-20",
      }}
    >
      <AppShell.Header>
        <GlobalShellHeader
          sidebarOpened={sidebarOpened}
          toggleSidebar={sidebarOpenedUtils.toggle}
        />
      </AppShell.Header>
      <AppShell.Navbar>
        <GlobalShellNavbar
          isOpen={sidebarOpened}
          onOpen={sidebarOpenedUtils.open}
          onClose={sidebarOpenedUtils.close}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        <Container fluid className={"max-w-screen-xl"}>
          {children}
        </Container>
      </AppShell.Main>
      <AppShell.Footer pos={"static"}>
        <GlobalShellFooter />
      </AppShell.Footer>
    </AppShell>
  );
};

export default GlobalAppShell;
