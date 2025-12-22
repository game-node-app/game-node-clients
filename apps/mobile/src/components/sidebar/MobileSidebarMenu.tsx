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
  useAwardEvent,
  UserButton,
  useRunningAwardEvent,
  useUserId,
} from "@repo/ui";
import {
  IconActivity,
  IconCloudDownload,
  IconDeviceGamepad2,
  IconLayout2Filled,
  IconLibrary,
  IconLogout,
  IconMessage,
  IconNews,
  IconNotebook,
  IconSettings,
  IconStars,
  IconTrophy,
  IconTrophyFilled,
} from "@tabler/icons-react";

const MobileSidebarMenu = () => {
  const userId = useUserId();
  const [wrappedOpened, wrappedOpenedUtils] = useDisclosure();
  const { isRunningEvent: isAwardsEventRunning, eventYear: awardsEventYear } =
    useRunningAwardEvent();

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
                title: "This is my GameNode Wrapped!",
                dialogTitle: "Share your wrapped with friends!",
                url: cachedFileResult.uri,
              });
            }}
          />
          <MobileSidebarButton
            title={"Collections"}
            Icon={IconLibrary}
            href={`/library/${userId}/collections`}
            onClick={closeMenu}
          />
          <MobileSidebarButton
            title={"Reviews"}
            Icon={IconStars}
            onClick={closeMenu}
            href={`/profile/${userId}/reviews`}
          />
          <MobileSidebarButton
            title={"Journal"}
            Icon={IconNotebook}
            onClick={closeMenu}
            href={`/journal/${userId}`}
          />
          <MobileSidebarButton
            title={"Posts"}
            Icon={IconMessage}
            onClick={closeMenu}
            href={`/posts`}
          />
          <MobileSidebarButton
            title={"Stats"}
            Icon={IconDeviceGamepad2}
            onClick={closeMenu}
            href={`/profile/${userId}/stats`}
          />
          <MobileSidebarButton
            title={"Wrapped"}
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
              title={"Awards"}
              Icon={IconTrophyFilled}
              href={`/awards/${awardsEventYear}`}
              onClick={closeMenu}
              withBadge
            />
          )}
          <MobileSidebarButton
            title={"Activity"}
            Icon={IconActivity}
            href={"/activity"}
            onClick={closeMenu}
          />
          <MobileSidebarButton
            title={"Blog"}
            Icon={IconNews}
            href={"/blog"}
            onClick={closeMenu}
          />
          <MobileSidebarButton
            title={"Achievements"}
            Icon={IconTrophy}
            onClick={closeMenu}
            href={`/achievements/${userId}`}
          />
          <MobileSidebarButton
            title={"Import Games"}
            Icon={IconCloudDownload}
            onClick={closeMenu}
            href={`/importer`}
          />
          <Stack className={"mt-auto gap-0"}>
            <MobileSidebarButton
              title={"Settings"}
              Icon={IconSettings}
              href={"/preferences"}
              onClick={closeMenu}
            />
            <MobileSidebarButton
              title={"Logout"}
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
