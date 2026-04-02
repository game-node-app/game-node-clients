import React from "react";
import { AppPage } from "@/components/general/AppPage.tsx";
import { AwardsNomineesScreen, useAwardEvent } from "@repo/ui";
import { blobToBase64 } from "@/util/imageUtils.ts";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useTranslation } from "@repo/locales";

interface Props {
  userId: string;
  eventYear: number | string;
}

const AwardsNomineesPage = ({ userId, eventYear }: Props) => {
  const { t } = useTranslation();
  const eventYearNumber =
    typeof eventYear === "string" ? Number.parseInt(eventYear) : eventYear;
  const { data: event } = useAwardEvent({ eventYear: eventYearNumber });

  if (!event) {
    return;
  }
  return (
    <AppPage>
      <AwardsNomineesScreen
        eventId={event.id}
        userId={userId}
        onShare={async (file) => {
          const base64 = await blobToBase64(file);

          const cachedFileResult = await Filesystem.writeFile({
            path: file.name,
            data: base64,
            directory: Directory.Cache,
          });

          await Share.share({
            title: t("mobile.awards.sharePrompt"),
            dialogTitle: t("mobile.awards.shareCreate"),
            url: cachedFileResult.uri,
          });
        }}
      />
    </AppPage>
  );
};

export default AwardsNomineesPage;
