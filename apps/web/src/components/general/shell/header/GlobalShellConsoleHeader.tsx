import { CommandCenter } from "@/components/general/shell/command-center/CommandCenter";
import GlobalShellHeaderNotifications from "@/components/general/shell/header/GlobalShellHeaderNotifications.tsx";
import { GlobalShellNavbarUserMenu } from "@/components/general/shell/navbar/user-menu/GlobalShellNavbarUserMenu";
import { ActionIcon, Box, Button, Group } from "@mantine/core";
import { toggleSpotlight } from "@mantine/spotlight";
import { useTranslation } from "@repo/locales";
import { ConsoleClock, useUserId } from "@repo/ui";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";
import React from "react";
import { CommandCenterModalOutlet } from "../command-center/CommandCenterModalOutlet";
import { CommandCenterContextProvider } from "../command-center/context/CommandCenterContext";

interface Props {
  navigation: React.ReactNode;
}

/**
 * Header for console app themes: profile on the left, navigation centered, status on the right.
 * Narrow screens follow the Xbox app instead: profile and status on top, navigation in a bottom bar.
 */
export default function GlobalShellConsoleHeader({ navigation }: Props) {
  const { t } = useTranslation();
  const userId = useUserId();

  return (
    <div className="gn-console-header-row">
      <CommandCenterContextProvider>
        <CommandCenterModalOutlet />
        <CommandCenter />
      </CommandCenterContextProvider>
      <Group className="gn-console-header-side">
        {userId ? (
          <GlobalShellNavbarUserMenu withDetails />
        ) : (
          <Link href={"/auth"}>
            <Button>{t("auth.signIn")}</Button>
          </Link>
        )}
      </Group>
      {/* below md the navigation moves to the bottom bar (GlobalAppShell) */}
      <Box visibleFrom="md" className="min-w-0">
        {navigation}
      </Box>
      <Group className="gn-console-header-side justify-end">
        {userId && (
          <>
            <ActionIcon
              variant={"transparent"}
              onClick={toggleSpotlight}
              c="unset"
            >
              <IconSearch />
            </ActionIcon>
            <GlobalShellHeaderNotifications />
          </>
        )}
        <Box visibleFrom="md">
          <ConsoleClock />
        </Box>
      </Group>
    </div>
  );
}
