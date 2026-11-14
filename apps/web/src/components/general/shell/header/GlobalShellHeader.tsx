import { CommandCenter } from "@/components/general/shell/command-center/CommandCenter";
import GlobalShellHeaderNotifications from "@/components/general/shell/header/GlobalShellHeaderNotifications";
import { TopbarIconButton } from "@/components/general/shell/header/TopbarIconButton";
import { Button } from "@mantine/core";
import { toggleSpotlight } from "@mantine/spotlight";
import { useTranslation } from "@repo/locales";
import { GameNodeLogo, NavSearchIcon, useUserId } from "@repo/ui";
import { IconMenu2 } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CommandCenterModalOutlet } from "../command-center/CommandCenterModalOutlet";
import { CommandCenterContextProvider } from "../command-center/context/CommandCenterContext";

interface IGlobalShellHeaderProps {
  sidebarOpened: boolean;
  toggleSidebar: () => void;
}

/**
 * Topbar/Bar (design node 5206:18769): a 56 px `nav-surface` panel with the
 * logo, the search button and the notification bell. The burger is only
 * rendered below `md`, where the Dock becomes a drawer.
 */
export default function GlobalShellHeader({
  sidebarOpened,
  toggleSidebar,
}: IGlobalShellHeaderProps) {
  const { t } = useTranslation();
  const userId = useUserId();
  const [modifierKey, setModifierKey] = useState("Ctrl");

  useEffect(() => {
    const key =
      navigator.platform.startsWith("Mac") || navigator.platform === "iPhone"
        ? "⌘"
        : "Ctrl";

    // Client-only detection: reading navigator during render would cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModifierKey(key);
  }, []);

  return (
    <div className="mx-4 flex h-14 items-center gap-2 rounded-md bg-nav-surface px-4">
      <CommandCenterContextProvider>
        <CommandCenterModalOutlet />
        <CommandCenter />
      </CommandCenterContextProvider>
      <TopbarIconButton
        label={t("navigation.menu")}
        aria-expanded={sidebarOpened}
        onClick={toggleSidebar}
        className="md:hidden"
      >
        <IconMenu2 size={20} stroke={1.6} />
      </TopbarIconButton>
      <Link href="/home" aria-label={t("navigation.home")}>
        <GameNodeLogo className="h-7 w-[72.8px]" />
      </Link>
      <div className="flex-1" />
      {!userId && (
        <Button component={Link} href="/auth" variant="outline">
          {t("auth.signIn")}
        </Button>
      )}
      {userId && (
        <>
          <TopbarIconButton
            label={t("navigation.search")}
            tooltip={`${t("navigation.search")} (${modifierKey} K)`}
            onClick={toggleSpotlight}
          >
            <NavSearchIcon size={20} />
          </TopbarIconButton>
          <GlobalShellHeaderNotifications />
        </>
      )}
    </div>
  );
}
