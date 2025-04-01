import { Burger, Button, Container, Group } from "@mantine/core";
import Link from "next/link";
import GlobalShellHeaderNotifications from "@/components/general/shell/GlobalShellHeader/GlobalShellHeaderNotifications.tsx";
import { GameNodeLogo, useUserId } from "@repo/ui";

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
          <GameNodeLogo className="ms-6 w-22 h-auto max-h-full" />
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
