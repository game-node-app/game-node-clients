import React from "react";
import { AppPage } from "@/components/general/AppPage.tsx";
import { AwardsNomineesScreen, useAwardEvent } from "@repo/ui";
import { blobToBase64 } from "@/util/imageUtils.ts";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

interface Props {
  userId: string;
  eventYear: number | string;
}

const AwardsNomineesPage = ({ userId, eventYear }: Props) => {
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
            title: "These are my GameNode Awards nominees!",
            dialogTitle: `Create yours at https://gamenode.app`,
            url: cachedFileResult.uri,
          });
        }}
      />
    </AppPage>
  );
};

export default AwardsNomineesPage;
