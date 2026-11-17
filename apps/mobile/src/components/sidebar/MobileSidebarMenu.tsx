// eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-expressions
// prettier-ignore
"use no memo";
import { MobileSidebarButton } from "@/components/sidebar/MobileSidebarButton.tsx";
import { menuController } from "@ionic/core/components";
import { IonContent, IonHeader, IonRippleEffect } from "@ionic/react";
import { Stack } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useLocation } from "react-router-dom";
import {
  Link,
  useRecapVisited,
  useSeasonEvents,
  UserButton,
  useUserId,
  signOut,
} from "@repo/ui";
import {
  IconActivity,
  IconAward,
  IconCloudDownload,
  IconDeviceGamepad2,
  IconHistory,
  IconLayout2Filled,
  IconLibrary,
  IconLogout,
  IconMessage,
  IconMilitaryAward,
  IconNews,
  IconNotebook,
  IconPuzzle,
  IconRobot,
  IconSettings,
  IconStars,
  IconTrophy,
} from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

const MobileSidebarMenu = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  const queryClient = useQueryClient();
  const season = useSeasonEvents();
  // Subscribes to navigation so the "Nova" marker is re-read after the Recap
  // page writes it; the page and this menu can stay mounted between routes.
  useLocation();
  const awardsEntry = season.awardsEntry;
  const awardsEvent = season.awardsEvent;
  const recapEntry = season.recapEntry;
  const recapHref = season.recapHref;
  const recapYear = recapEntry?.year ?? null;
  const recapVisited = useRecapVisited(recapYear);
  const showRecapEntry = !!recapHref && !!recapEntry;

  const closeMenu = () => {
    menuController.close("main-menu").catch(console.error);
  };

  return (
    <>
      {userId && (
        <IonHeader className={"relative ion-activatable"}>
          <IonRippleEffect onClick={closeMenu} />
          <Link href={`/profile/${userId}`} onClick={closeMenu}>
            <UserButton
              userId={userId}
              count={"level"}
              className={"px-6 py-3.5"}
              avatarProps={{
                size: "md",
              }}
            />
          </Link>
        </IonHeader>
      )}
      <IonContent>
        <Stack className={"w-full min-h-full gap-0"}>
          <MobileSidebarButton
            title={t("navigation.collections")}
            Icon={IconLibrary}
            href={`/library/${userId}/collections`}
            onClick={closeMenu}
          />
          <MobileSidebarButton
            title={t("navigation.reviews")}
            Icon={IconStars}
            onClick={closeMenu}
            href={`/profile/${userId}/reviews`}
          />
          <MobileSidebarButton
            title={t("navigation.journal")}
            Icon={IconNotebook}
            onClick={closeMenu}
            href={`/journal/${userId}`}
          />
          <MobileSidebarButton
            title={t("navigation.posts")}
            Icon={IconMessage}
            onClick={closeMenu}
            href={`/posts`}
          />
          <MobileSidebarButton
            title={t("navigation.stats")}
            Icon={IconDeviceGamepad2}
            onClick={closeMenu}
            href={`/profile/${userId}/stats`}
          />
          <MobileSidebarButton
            title={t("mobile.wrapped.title")}
            Icon={IconLayout2Filled}
            href={"/wrapped"}
            onClick={closeMenu}
            withBadge
            badgeLabel={t("navigation.new")}
          />
          {showRecapEntry && recapHref && (
            <MobileSidebarButton
              title={t("navigation.recap")}
              Icon={IconHistory}
              href={recapHref}
              onClick={closeMenu}
              withBadge={!recapVisited}
              badgeLabel={t("navigation.dock.badgeNewFeminine")}
            />
          )}
          {awardsEntry && awardsEvent && (
            <MobileSidebarButton
              title={t("navigation.awards", { year: awardsEvent.year })}
              Icon={IconAward}
              href={awardsEntry.href}
              onClick={closeMenu}
              withBadge={!!awardsEntry.dockBadge}
              badgeLabel={
                awardsEntry.dockBadge === "live"
                  ? t("navigation.dock.badgeLive")
                  : awardsEntry.dockBadge === "new"
                    ? t("navigation.new")
                    : undefined
              }
            />
          )}
          <MobileSidebarButton
            title={t("navigation.daily")}
            Icon={IconPuzzle}
            onClick={closeMenu}
            href={"/daily"}
            withBadge
          />
          <MobileSidebarButton
            title={t("navigation.activity")}
            Icon={IconActivity}
            href={"/activity"}
            onClick={closeMenu}
          />
          <MobileSidebarButton
            title={t("navigation.blog")}
            Icon={IconNews}
            href={"/blog"}
            onClick={closeMenu}
          />
          <MobileSidebarButton
            title={t("navigation.achievements")}
            Icon={IconTrophy}
            onClick={closeMenu}
            href={`/achievements/${userId}`}
          />
          <MobileSidebarButton
            title={t("navigation.feats")}
            Icon={IconMilitaryAward}
            onClick={closeMenu}
            href={`/feats/${userId}`}
          />
          <MobileSidebarButton
            title={t("mcp.title")}
            Icon={IconRobot}
            onClick={closeMenu}
            href={"/mcp"}
            withBadge
          />
          <MobileSidebarButton
            title={t("library.buttons.importGames")}
            Icon={IconCloudDownload}
            onClick={closeMenu}
            href={`/importer`}
          />
          <Stack className={"mt-auto gap-0"}>
            <MobileSidebarButton
              title={t("navigation.settings")}
              Icon={IconSettings}
              href={"/preferences"}
              onClick={closeMenu}
            />
            <MobileSidebarButton
              title={t("actions.logout")}
              Icon={IconLogout}
              href={"#"}
              onClick={() => {
                signOut(queryClient).then(() => {
                  closeMenu();
                });
              }}
              iconProps={{
                className: "text-[#1D1D1D]",
              }}
              textProps={{
                className: "text-[#1A1A1A] font-medium",
              }}
              className={"bg-[#DDA4A4]"}
            />
          </Stack>
        </Stack>
      </IonContent>
    </>
  );
};

export { MobileSidebarMenu };
