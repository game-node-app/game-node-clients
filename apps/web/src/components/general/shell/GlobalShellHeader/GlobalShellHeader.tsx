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
import { useTranslation } from "@repo/locales";

interface IGlobalShellHeaderProps {
  sidebarOpened: boolean;
  toggleSidebar: () => void;
}

export default function GlobalShellHeader({
  sidebarOpened,
  toggleSidebar,
}: IGlobalShellHeaderProps) {
  const { t } = useTranslation();
  const { pathname } = useRouter();
  const userId = useUserId();

  const onMobile = useOnMobile();

  const [wrappedOpened, { close, open }] = useDisclosure();

  return (
    <header className="h-full">
      <Container fluid className="flex h-full items-center lg:justify-start">
        <Burger
          className={"block xs:hidden me-6"}
          opened={sidebarOpened}
          onClick={toggleSidebar}
          size="sm"
        />
        <a href={"/search"}>
          <GameNodeLogo className="w-20 h-auto max-h-full" />
        </a>
        <Group className="ms-auto">
          {!userId && (
            <Link href={"/auth"}>
              <Button variant="outline">{t("auth.signIn")}</Button>
            </Link>
          )}
          {userId != undefined && (
            <Group className={"gap-3"}>
              <RecentlyPlayedGamesShare
                opened={wrappedOpened}
                onClose={close}
                onShare={async (file) => {
                  const toShare: ShareData = {
                    title: t("game.share.title"),
                    text: t("game.share.recentlyPlayed"),
                    files: [file],
                    url: `https://gamenode.app`,
                  };

                  await navigator.share(toShare);
                }}
              />
              <GlobalShellHeaderNotifications />
            </Group>
          )}
        </Group>
      </Container>
    </header>
  );
}
