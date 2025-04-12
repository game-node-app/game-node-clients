import React, { useMemo } from "react";
import { EUserRoles, getRolesForRoute } from "@/components/auth/roles.ts";
import {
  AppShell,
  Burger,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { Navbar } from "@/components/Navbar/Navbar.tsx";
import { navLinks } from "@/components/Navbar/Navbar.config.ts";
import { AdminHeader } from "@/components/Headers/AdminHeader.tsx";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import {
  CenteredLoading,
  SessionAuthWithRoles,
  useOnMobile,
  useUserRoles,
} from "@repo/ui";

interface Props {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: Props) => {
  const router = useRouter();
  const pathname = router.pathname;
  const onMobile = useOnMobile();
  const userRoles = useUserRoles();
  // Initially opened on desktop
  const [opened, { toggle }] = useDisclosure(!onMobile);
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  const bg =
    colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0];

  if (!pathname.startsWith("/dashboard")) {
    return children;
  }

  return (
    <SessionAuthWithRoles roles={getRolesForRoute(pathname)}>
      <AppShell
        header={{ height: 80 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { mobile: !opened },
        }}
        padding="md"
        transitionDuration={500}
        transitionTimingFunction="ease"
      >
        <AppShell.Navbar>
          <Navbar data={navLinks} hidden={!opened} />
        </AppShell.Navbar>
        <AppShell.Header>
          <AdminHeader
            burger={
              <Burger
                hiddenFrom={"sm"}
                opened={opened}
                onClick={toggle}
                size="sm"
                mr="xl"
              />
            }
          />
        </AppShell.Header>
        <AppShell.Main bg={bg}>{children}</AppShell.Main>
      </AppShell>
    </SessionAuthWithRoles>
  );
};

export { DashboardLayout };
