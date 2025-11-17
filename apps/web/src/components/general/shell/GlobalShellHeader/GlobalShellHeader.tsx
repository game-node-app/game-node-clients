import { ActionIcon, Burger, Button, Container, Group } from "@mantine/core";
import Link from "next/link";
import GlobalShellHeaderNotifications from "@/components/general/shell/GlobalShellHeader/GlobalShellHeaderNotifications.tsx";
import {
  GameNodeLogo,
  RecentlyPlayedGamesShare,
  useOnMobile,
  useUserId,
} from "@repo/ui";
import { useDisclosure } from "@mantine/hooks";
import { IconCalendarWeek } from "@tabler/icons-react";
import { useRouter } from "next/router";

interface IGlobalShellHeaderProps {
  sidebarOpened: boolean;
  toggleSidebar: () => void;
}

export default function GlobalShellHeader({
  sidebarOpened,
  toggleSidebar,
}: IGlobalShellHeaderProps) {
  const { pathname } = useRouter();
  const userId = useUserId();

  const onMobile = useOnMobile();

  const [wrappedOpened, { close, open }] = useDisclosure();

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
              <RecentlyPlayedGamesShare
                opened={wrappedOpened}
                onClose={close}
                onShare={async (file) => {
                  const toShare: ShareData = {
                    title: "GameNode Share",
                    text: `These are my recently played games!`,
                    files: [file],
                    url: `https://gamenode.app`,
                  };

                  await navigator.share(toShare);
                }}
              />
              {onMobile ? (
                <ActionIcon variant={"transparent"} onClick={open}>
                  <IconCalendarWeek />
                </ActionIcon>
              ) : (
                <Button
                  variant={"outline"}
                  className={"rounded-xl text-white"}
                  onClick={open}
                >
                  Wrapped
                </Button>
              )}

              <GlobalShellHeaderNotifications />
            </Group>
          )}
        </Group>
      </Container>
    </header>
  );
}
