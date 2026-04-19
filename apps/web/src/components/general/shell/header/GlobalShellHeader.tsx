import {
  ActionIcon,
  Anchor,
  Burger,
  Button,
  Flex,
  Group,
  Select,
} from "@mantine/core";
import Link from "next/link";
import GlobalShellHeaderNotifications from "@/components/general/shell/header/GlobalShellHeaderNotifications.tsx";
import {
  GameNodeLogo,
  GameSearchSelectModal,
  Modal,
  RecentlyPlayedGamesShare,
  useUserId,
} from "@repo/ui";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import {
  SupportedLanguage,
  useI18nContext,
  useTranslation,
} from "@repo/locales";
import { IconSearch } from "@tabler/icons-react";
import { GlobalShellHeaderSearch } from "@/components/general/shell/header/GlobalShellHeaderSearch";
import { CommandCenter } from "@/components/general/shell/command-center/CommandCenter";
import { toggleSpotlight } from "@mantine/spotlight";

interface IGlobalShellHeaderProps {
  sidebarOpened: boolean;
  toggleSidebar: () => void;
}

export default function GlobalShellHeader({
  sidebarOpened,
  toggleSidebar,
}: IGlobalShellHeaderProps) {
  const { t } = useTranslation();
  const { locale, push } = useRouter();
  const userId = useUserId();

  return (
    <Flex className="w-full h-full items-center lg:justify-start px-4">
      <CommandCenter />
      <Burger
        className={"block xs:hidden me-6"}
        opened={sidebarOpened}
        onClick={toggleSidebar}
        size="sm"
      />
      <Anchor href={locale ? `/${locale}/home` : "/home"}>
        <GameNodeLogo className="w-20 h-auto max-h-full" />
      </Anchor>
      <Group className="ms-auto">
        {!userId && (
          <Link href={"/auth"}>
            <Button variant="outline">{t("auth.signIn")}</Button>
          </Link>
        )}
        {userId != undefined && (
          <Group className={"gap-3"}>
            <ActionIcon variant={"transparent"} onClick={toggleSpotlight}>
              <IconSearch />
            </ActionIcon>
            <GlobalShellHeaderNotifications />
          </Group>
        )}
      </Group>
    </Flex>
  );
}
