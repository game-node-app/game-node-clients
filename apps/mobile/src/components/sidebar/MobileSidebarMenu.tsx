// eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-expressions
// prettier-ignore
"use no memo";
import { MobileSidebarButton } from "@/components/sidebar/MobileSidebarButton.tsx";
import { MobileSidebarSection } from "@/components/sidebar/MobileSidebarSection.tsx";
import { closeMainMenu } from "@/util/closeMainMenu";
import { WRAPPED_TAB_PATH } from "@/util/getTabAwareHref";
import { App } from "@capacitor/app";
import { IonContent, IonHeader, IonRippleEffect } from "@ionic/react";
import { Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  getS3StoredUpload,
  Link,
  useRecapVisited,
  useSeasonEvents,
  useUserProfile,
  UserButton,
  useUserId,
  signOut,
  GameNodeLogo,
} from "@repo/ui";
import {
  IconActivity,
  IconAward,
  IconCloudDownload,
  IconDeviceGamepad2,
  IconHistory,
  IconLayout2,
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
  const profile = useUserProfile(userId);
  const banner = profile.data?.banner;
  const bannerSrc = banner
    ? getS3StoredUpload(`${banner.filename}.${banner.extension}`)
    : undefined;

  const [appVersion, setAppVersion] = useState<string>();
  useEffect(() => {
    // native build version; unavailable in the browser, where the row is simply hidden
    App.getInfo()
      .then((info) => setAppVersion(info.version))
      .catch(() => undefined);
  }, []);

  const closeMenu = () => {
    closeMainMenu().catch(console.error);
  };

  return (
    <>
      {userId && (
        <IonHeader
          className={"relative ion-activatable ion-no-border"}
          style={{
            backgroundColor: "#161616",
            backgroundImage: bannerSrc
              ? `linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.45)), url(${bannerSrc})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <IonRippleEffect onClick={closeMenu} />
          <Link href={`/profile/${userId}`} onClick={closeMenu}>
            <UserButton
              userId={userId}
              count={"viewProfile"}
              boldName
              className={"px-6 pt-10 pb-5"}
              avatarProps={{
                size: "xl",
              }}
            />
          </Link>
          {/* soft fade into the menu background below the banner */}
          <div
            aria-hidden
            className={"pointer-events-none absolute inset-x-0 bottom-0 h-8"}
            style={{
              background: "linear-gradient(to bottom, transparent, #0F0F0F)",
            }}
          />
        </IonHeader>
      )}
      <IonContent>
        <Stack className={"w-full min-h-full gap-2 bg-[#0F0F0F] p-2"}>
          <MobileSidebarSection title={t("navigation.sidebar.groups.yourSpace")}>
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
              title={t("navigation.stats")}
              Icon={IconDeviceGamepad2}
              onClick={closeMenu}
              href={`/profile/${userId}/stats`}
            />
            <MobileSidebarButton
              title={t("library.buttons.importGames")}
              Icon={IconCloudDownload}
              onClick={closeMenu}
              href={`/importer`}
            />
          </MobileSidebarSection>
          <MobileSidebarSection title={t("navigation.sidebar.groups.highlights")}>
            <MobileSidebarButton
              title={t("mobile.wrapped.title")}
              Icon={IconLayout2}
              href={WRAPPED_TAB_PATH}
              absolute
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
              badgeLabel={t("navigation.new")}
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
          </MobileSidebarSection>
          <MobileSidebarSection title={t("navigation.sidebar.groups.community")}>
            <MobileSidebarButton
              title={t("navigation.posts")}
              Icon={IconMessage}
              onClick={closeMenu}
              href={`/posts`}
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
          </MobileSidebarSection>
          <MobileSidebarSection title={t("navigation.sidebar.groups.tools")}>
            <MobileSidebarButton
              title={t("mcp.title")}
              Icon={IconRobot}
              onClick={closeMenu}
              href={"/mcp"}
              withBadge
              badgeLabel={t("navigation.new")}
            />
          </MobileSidebarSection>
          <MobileSidebarSection title={t("navigation.sidebar.groups.account")}>
            <MobileSidebarButton
              title={t("navigation.settings")}
              Icon={IconSettings}
              href={"/preferences"}
              onClick={closeMenu}
            />
            <div className={"mx-6 mt-2 mb-1 border-t border-white/10"} />
            <div className={"flex flex-col items-start gap-2 px-6 py-5"}>
              <GameNodeLogo style={{ width: 84 }} />
              {appVersion && (
                <Text size={"xs"} c={"dimmed"} fw={500}>
                  {t("navigation.sidebar.version", { version: appVersion })}
                </Text>
              )}
            </div>
            <MobileSidebarButton
              title={t("actions.logout")}
              Icon={IconLogout}
              href={"#"}
              hideChevron
              onClick={() => {
                signOut(queryClient).then(() => {
                  closeMenu();
                });
              }}
              iconProps={{ className: "text-red-400" }}
              textProps={{ className: "text-red-400" }}
            />
          </MobileSidebarSection>
        </Stack>
      </IonContent>
    </>
  );
};

export { MobileSidebarMenu };
