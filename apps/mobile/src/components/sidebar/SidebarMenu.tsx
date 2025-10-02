import React from "react";
import { IonContent, IonHeader, IonRippleEffect } from "@ionic/react";
import { UserButton, useUserId } from "@repo/ui";
import { Stack } from "@mantine/core";
import { SidebarButton } from "@/components/sidebar/SidebarButton.tsx";
import {
  IconCalendar,
  IconDeviceGamepad2,
  IconLayout2Filled,
  IconLibrary,
  IconMessage,
  IconNews,
  IconNotebook,
  IconStarFilled,
  IconStars,
  IconTrophy,
  IconWriting,
} from "@tabler/icons-react";

const SidebarMenu = () => {
  const userId = useUserId();
  return (
    <>
      {userId && (
        <IonHeader className={"relative ion-activatable"}>
          <IonRippleEffect />
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
          <SidebarButton
            title={"Collections"}
            Icon={IconLibrary}
            href={`/library/${userId}/collections`}
          />
          <SidebarButton
            title={"Reviews"}
            Icon={IconStars}
            href={`/profile/${userId}/reviews`}
          />
          <SidebarButton
            title={"Journal"}
            Icon={IconNotebook}
            href={`/journal/${userId}`}
          />
          <SidebarButton title={"Posts"} Icon={IconMessage} href={`/posts`} />
          <SidebarButton
            title={"Stats"}
            Icon={IconDeviceGamepad2}
            href={`/profile/${userId}/stats`}
          />
          <SidebarButton
            title={"Wrapped"}
            Icon={IconLayout2Filled}
            href={`/profile/${userId}/stats`}
          />
          <SidebarButton title={"Blog"} Icon={IconNews} href={"/blog"} />
          <SidebarButton
            title={"Achievements"}
            Icon={IconTrophy}
            href={`/achievements/${userId}`}
          />
        </Stack>
      </IonContent>
    </>
  );
};

export { SidebarMenu };
