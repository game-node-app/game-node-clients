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
import GlobalShellHeaderNotifications from "@/components/general/shell/GlobalShellHeader/GlobalShellHeaderNotifications.tsx";
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
import { GlobalShellHeaderSearch } from "@/components/general/shell/GlobalShellHeader/GlobalShellHeaderSearch";

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

  const [searchModalOpened, searchModalUtils] = useDisclosure();

  return (
    <Flex className="w-full h-full items-center lg:justify-start px-4">
      <GlobalShellHeaderSearch
        opened={searchModalOpened}
        onClose={searchModalUtils.close}
      />
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
            <ActionIcon variant={"transparent"} onClick={searchModalUtils.open}>
              <IconSearch />
            </ActionIcon>
            <GlobalShellHeaderNotifications />
          </Group>
        )}
      </Group>
    </Flex>
  );
}
