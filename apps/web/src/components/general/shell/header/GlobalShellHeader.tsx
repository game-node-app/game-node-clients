import { CommandCenter } from "@/components/general/shell/command-center/CommandCenter";
import GlobalShellHeaderNotifications from "@/components/general/shell/header/GlobalShellHeaderNotifications.tsx";
import { ActionIcon, Anchor, Burger, Button, Flex, Group } from "@mantine/core";
import { toggleSpotlight } from "@mantine/spotlight";
import { useTranslation } from "@repo/locales";
import { GameNodeLogo, useUserId } from "@repo/ui";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { CommandCenterModalOutlet } from "../command-center/CommandCenterModalOutlet";
import { CommandCenterContextProvider } from "../command-center/context/CommandCenterContext";

interface IGlobalShellHeaderProps {
  sidebarOpened: boolean;
  toggleSidebar: () => void;
}

export default function GlobalShellHeader({
  sidebarOpened,
  toggleSidebar,
}: IGlobalShellHeaderProps) {
  const { t } = useTranslation();
  const { locale } = useRouter();
  const userId = useUserId();

  return (
    <Flex className="w-full h-full items-center lg:justify-start px-4">
      <CommandCenterContextProvider>
        <CommandCenterModalOutlet />
        <CommandCenter />
      </CommandCenterContextProvider>
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
