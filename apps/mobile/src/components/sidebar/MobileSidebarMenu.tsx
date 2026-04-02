// eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unused-expressions
// prettier-ignore
"use no memo";
import React from "react";
import { signOut } from "supertokens-website";
import { MobileSidebarButton } from "@/components/sidebar/MobileSidebarButton.tsx";
import { blobToBase64 } from "@/util/imageUtils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { menuController } from "@ionic/core/components";
import { IonContent, IonHeader, IonRippleEffect } from "@ionic/react";
import { Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Link,
  RecentlyPlayedGamesShare,
  useCurrentRecapStatus,
  UserButton,
  useRunningAwardEvent,
  useUserId,
} from "@repo/ui";
import {
  IconActivity,
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
  IconSettings,
  IconStars,
  IconTrophy,
  IconTrophyFilled,
} from "@tabler/icons-react";
import { useTranslation } from "@repo/locales";

const MobileSidebarMenu = () => {
  const { t } = useTranslation();
  const userId = useUserId();
  const [wrappedOpened, wrappedOpenedUtils] = useDisclosure();
  const { isRunningEvent: isAwardsEventRunning, eventYear: awardsEventYear } =
    useRunningAwardEvent();
  const { isRecapCreated, targetYear } = useCurrentRecapStatus(userId);

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
        <Stack className={"w-full h-full gap-0"}>
          <RecentlyPlayedGamesShare
            opened={wrappedOpened}
            onClose={wrappedOpenedUtils.close}
            onShare={async (file) => {
              const base64 = await blobToBase64(file);

              const cachedFileResult = await Filesystem.writeFile({
                path: file.name,
                data: base64,
                directory: Directory.Cache,
              });

              await Share.share({
                title: t("mobile.wrapped.sharePrompt"),
                dialogTitle: t("mobile.wrapped.shareDescription"),
                url: cachedFileResult.uri,
              });
            }}
          />
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
            href={`/profile/${userId}/stats`}
            onClick={(evt) => {
              evt.preventDefault();
              wrappedOpenedUtils.open();
              closeMenu();
            }}
          />
          {isAwardsEventRunning && (
            <MobileSidebarButton
              title={t("awards.title")}
              Icon={IconTrophyFilled}
              href={`/awards/${awardsEventYear}`}
              onClick={closeMenu}
              withBadge
            />
          )}
          {isRecapCreated && (
            <MobileSidebarButton
              title={t("mobile.wrapped.recap", { year: targetYear })}
              Icon={IconHistory}
              href={`/recap/${targetYear}/${userId}`}
              onClick={closeMenu}
              withBadge
            />
          )}
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
                signOut().then(() => {
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
