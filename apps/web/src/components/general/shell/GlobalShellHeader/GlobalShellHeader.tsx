import { Container, Burger, Box, Button, AppShell, Group } from "@mantine/core";
import GameNodeLogo from "@/components/general/GameNodeLogo";
import Link from "next/link";
import useUserId from "@/components/auth/hooks/useUserId";
import { useDisclosure } from "@mantine/hooks";
import { IconSettings } from "@tabler/icons-react";
import GlobalShellHeaderNotifications from "@/components/general/shell/GlobalShellHeader/GlobalShellHeaderNotifications";

interface IGlobalShellHeaderProps {
    sidebarOpened: boolean;
    toggleSidebar: () => void;
}

export default function GlobalShellHeader({
    sidebarOpened,
    toggleSidebar,
}: IGlobalShellHeaderProps) {
    const userId = useUserId();
    return (
        <header className="h-full">
            <Container
                fluid
                className="flex h-full items-center lg:justify-start"
            >
                <Burger
                    opened={sidebarOpened}
                    onClick={toggleSidebar}
                    size="sm"
                />
                <a href={"/search"}>
                    <GameNodeLogo
                        className="ms-6 w-22 h-auto max-h-full"
                        withBetaBadge={false}
                    />
                </a>
                <Group className="ms-auto">
                    {!userId && (
                        <Link href={"/auth"}>
                            <Button variant="outline">Sign in</Button>
                        </Link>
                    )}
                    {userId && <GlobalShellHeaderNotifications />}
                </Group>
            </Container>
        </header>
    );
}
