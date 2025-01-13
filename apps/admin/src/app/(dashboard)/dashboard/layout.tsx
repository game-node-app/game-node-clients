"use client";

import React from "react";

import {
    AppShell,
    Burger,
    Text,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AdminHeader } from "@/components/Headers/AdminHeader";
import { Navbar } from "@/components/Navbar/Navbar";
import { navLinks } from "@/components/Navbar/Navbar.config";
import SessionAuthWithRoles from "@/components/auth/SessionAuthWithRoles";
import { EUserRoles } from "@/components/auth/roles";
import useOnMobile from "@/components/general/hooks/useOnMobile";

interface Props {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
    const onMobile = useOnMobile();
    // Initially opened on desktop
    const [opened, { toggle }] = useDisclosure(!onMobile);
    const { colorScheme } = useMantineColorScheme();
    const theme = useMantineTheme();

    const bg =
        colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[0];

    return (
        <SessionAuthWithRoles roles={[EUserRoles.USER, EUserRoles.MOD]}>
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
}
