import React, { useState } from "react";
import { IonItem, IonItemDivider, IonItemGroup, IonLabel } from "@ionic/react";
import { getTabAwareHref } from "@/util/getTabAwareHref.ts";
import { Group } from "@mantine/core";
import { IconCalendarMonth, IconCalendarWeek } from "@tabler/icons-react";
import { blobToBase64 } from "@/util/imageUtils.ts";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { RecentlyPlayedGamesShare } from "@repo/ui";
import { useTranslation } from "@repo/locales";

const PreferencesWrappedItems = () => {
  const { t } = useTranslation();
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
            directory: Directory.Library,
          });

          await Share.share({
            title: t("mobile.wrapped.sharePrompt"),
            dialogTitle: t("mobile.wrapped.shareDescription"),
            url: cachedFileResult.uri,
          });
        }}
      />
      <IonItemDivider>
        <IonLabel>{t("mobile.wrapped.title")}</IonLabel>
      </IonItemDivider>

      <IonItem button onClick={() => setWrappedOpened(true)}>
        <Group className={"gap-2"}>
          <IconCalendarWeek />
          <IonLabel>{t("mobile.wrapped.recentlyPlayed")}</IonLabel>
        </Group>
      </IonItem>
    </IonItemGroup>
  );
};

export { PreferencesWrappedItems };
