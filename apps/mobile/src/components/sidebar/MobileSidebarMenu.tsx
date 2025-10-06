import React from "react";
import { IonContent, IonHeader, IonRippleEffect } from "@ionic/react";
import { RecentlyPlayedGamesShare, UserButton, useUserId } from "@repo/ui";
import { Stack } from "@mantine/core";
import { MobileSidebarButton } from "@/components/sidebar/MobileSidebarButton.tsx";
import {
  IconDeviceGamepad2,
  IconLayout2Filled,
  IconLibrary,
  IconMessage,
  IconNews,
  IconNotebook,
  IconStars,
  IconTrophy,
} from "@tabler/icons-react";
import { blobToBase64 } from "@/util/imageUtils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useDisclosure } from "@mantine/hooks";
import { menuController } from "@ionic/core/components";

const MobileSidebarMenu = () => {
  const userId = useUserId();
  const [wrappedOpened, wrappedOpenedUtils] = useDisclosure();

  const closeMenu = () => {
    menuController.close("main-menu").catch(console.error);
  };

  return (
    <>
      {userId && (
        <IonHeader className={"relative ion-activatable"}>
          <IonRippleEffect onClick={closeMenu} />
          <UserButton
            userId={userId}
            count={"level"}
            className={"px-6 py-3.5"}
            avatarProps={{
              size: "md",
            }}
          />
        </IonHeader>
      )}
      <IonContent>
        <Stack className={"w-full gap-0"}>
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
        </Stack>
      </IonContent>
    </>
  );
};

export { MobileSidebarMenu };
