import { CommandCenter } from "@/components/general/shell/command-center/CommandCenter";
import { CommandCenterModalOutlet } from "@/components/general/shell/command-center/CommandCenterModalOutlet";
import { CommandCenterContextProvider } from "@/components/general/shell/command-center/context/CommandCenterContext";
import { ConsoleAccountMenu } from "@/components/general/shell/header/ConsoleAccountMenu";
import GlobalShellHeaderNotifications from "@/components/general/shell/header/GlobalShellHeaderNotifications";
import { TopbarIconButton } from "@/components/general/shell/header/TopbarIconButton";
import { GlobalShellConsoleNav } from "@/components/general/shell/navbar/GlobalShellConsoleNav";
import { toggleSpotlight } from "@mantine/spotlight";
import { useWindowScroll } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { cn, GameNodeLogo, NavSearchIcon, useUserId } from "@repo/ui";
import Link from "next/link";
import styles from "./GlobalShellConsoleHeader.module.css";

/** Header becomes opaque once the page has scrolled past this offset. */
const SCROLLED_OFFSET = 24;

/**
 * Console header (web): logo, the main navigation, search, notifications and
 * the signed-in profile (avatar, name and level) or a sign-in button.
 *
 * It starts see-through over the page hero and turns opaque after scrolling.
 * Below `md` the profile moves to the left, navigation moves to the bottom bar
 * (GlobalAppShell) and the header keeps only the profile and the actions.
 */
export default function GlobalShellConsoleHeader() {
  const { t } = useTranslation();
  const userId = useUserId();
  const [{ y }] = useWindowScroll();

  return (
    <div
      className={styles.header}
      data-console-header=""
      data-scrolled={y > SCROLLED_OFFSET ? "" : undefined}
    >
      <CommandCenterContextProvider>
        <CommandCenterModalOutlet />
        <CommandCenter />
      </CommandCenterContextProvider>

      <div className={styles.side}>
        <Link
          href="/home"
          aria-label={t("navigation.home")}
          className={styles.logo}
        >
          <GameNodeLogo className="h-7 w-[72.8px]" />
        </Link>
        {/* Below md the logo hides, so the profile keeps the left side. */}
        <div className={styles.mobileProfile}>
          <ConsoleAccountMenu />
        </div>
      </div>

      <div className={styles.center}>
        <GlobalShellConsoleNav variant="header" />
      </div>

      <div className={cn(styles.side, styles.sideEnd)}>
        {userId && (
          <>
            <TopbarIconButton
              label={t("navigation.search")}
              onClick={toggleSpotlight}
            >
              <NavSearchIcon size={20} />
            </TopbarIconButton>
            <GlobalShellHeaderNotifications />
          </>
        )}
        <div className={styles.desktopProfile}>
          <ConsoleAccountMenu />
        </div>
      </div>
    </div>
  );
}
