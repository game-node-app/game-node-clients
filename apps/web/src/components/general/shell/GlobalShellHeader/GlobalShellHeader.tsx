import { ActionIcon, Burger, Button, Container, Group } from "@mantine/core";
import GameNodeLogo from "@/components/general/GameNodeLogo";
import Link from "next/link";
import useUserId from "@/components/auth/hooks/useUserId";
import GlobalShellHeaderNotifications from "@/components/general/shell/GlobalShellHeader/GlobalShellHeaderNotifications";
import { UserRecentGamesShare } from "@repo/ui";
import { useState } from "react";
import { IconCalendarWeek } from "@tabler/icons-react";

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
      <Container fluid className="flex h-full items-center lg:justify-start">
        <Burger opened={sidebarOpened} onClick={toggleSidebar} size="sm" />
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
          {userId != undefined && (
            <Group className={"gap-3"}>
              <GlobalShellHeaderNotifications />
            </Group>
          )}
        </Group>
      </Container>
    </header>
  );
}
