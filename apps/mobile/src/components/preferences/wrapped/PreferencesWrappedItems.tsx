import React, { useState } from "react";
import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { getTabAwareHref } from "@/util/getTabAwareHref.ts";
import { Group } from "@mantine/core";
import { IconCalendarMonth, IconCalendarWeek } from "@tabler/icons-react";
import { blobToBase64 } from "@/util/imageUtils.ts";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { RecentlyPlayedGamesShare } from "@repo/ui";

const PreferencesWrappedItems = () => {
  const [wrappedOpened, setWrappedOpened] = useState(false);

  return (
    <IonItemGroup>
      <RecentlyPlayedGamesShare
        opened={wrappedOpened}
        onClose={() => {
          setWrappedOpened(false);
        }}
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
      <IonItemDivider>
        <IonLabel>Wrapped</IonLabel>
      </IonItemDivider>

      <IonItem button onClick={() => setWrappedOpened(true)}>
        <Group className={"gap-2"}>
          <IconCalendarWeek />
          <IonLabel>Recently played games</IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export { PreferencesWrappedItems };
