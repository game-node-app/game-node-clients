import React, { useState } from "react";
import { AppShell, Box, Container, useMantineTheme } from "@mantine/core";
import GlobalShellHeader from "@/components/general/shell/GlobalShellHeader/GlobalShellHeader";
import { useDisclosure, useHeadroom } from "@mantine/hooks";
import GlobalShellFooter from "@/components/general/shell/GlobalShellFooter";
import GlobalShellNavbar from "@/components/general/shell/GlobalShellNavbar/GlobalShellNavbar";
import { useRouter } from "next/router";

/**
 * https://mantine.dev/core/app-shell/
 * @param children - The main content of the page
 * @constructor
 */
const GlobalAppShell = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useRouter();

  const [sidebarOpened, sidebarOpenedUtils] = useDisclosure(false);

  if (pathname === "/" || pathname === "/about") {
    return children;
  }

  return (
    <AppShell
      header={{
        height: { base: 80, md: 70 },
      }}
      footer={{ height: 60, offset: false }}
      navbar={{
        width: 300,
        breakpoint: "xs",
        collapsed: {
          mobile: !sidebarOpened,
          desktop: !sidebarOpened,
        },
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
          onOpen={sidebarOpenedUtils.open}
          onClose={sidebarOpenedUtils.close}
        />
      </AppShell.Navbar>
      <AppShell.Main pos={"relative"}>
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
