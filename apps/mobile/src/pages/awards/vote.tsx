import { AppPage } from "@/components/general/AppPage.tsx";
import { blobToBase64 } from "@/util/imageUtils";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { AwardsBallotScreen } from "@repo/ui";

interface Props {
  eventYear: number | string;
}

const AwardsVotePage = ({ eventYear }: Props) => {
  const { t } = useTranslation();
  const eventYearNumber =
    typeof eventYear === "string" ? Number.parseInt(eventYear, 10) : eventYear;

  const shareFile = async (file: File) => {
    if (!Capacitor.isNativePlatform()) {
      if (!navigator.share) {
        throw new Error(t("awards.ballot.shareModal.shareUnsupported"));
      }
      const shareData = {
        title: t("awards.ballot.title"),
        files: [file],
      };
      if (navigator.canShare && !navigator.canShare(shareData)) {
        throw new Error(t("awards.ballot.shareModal.shareUnsupported"));
      }
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        throw error;
      }
      return;
    }

    const base64 = await blobToBase64(file);

    const cachedFileResult = await Filesystem.writeFile({
      path: file.name,
      data: base64,
      directory: Directory.Cache,
    });

    await Share.share({
      title: t("awards.ballot.title"),
      dialogTitle: t("awards.ballot.share"),
      url: cachedFileResult.uri,
    });
  };

  const downloadFile = async (file: File) => {
    if (!Capacitor.isNativePlatform()) {
      const objectURL = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.download = file.name;
      link.href = objectURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectURL);
      return;
    }

    try {
      const base64 = await blobToBase64(file);
      await Filesystem.writeFile({
        path: file.name,
        data: base64,
        directory: Directory.Documents,
        recursive: true,
      });
      notifications.show({ message: t("awards.ballot.shareModal.saved") });
    } catch {
      await shareFile(file);
    }
  };

  return (
    <AppPage title={t("awards.ballot.title")} withSearch={false}>
      <AwardsBallotScreen
        eventYear={eventYearNumber}
        onShare={shareFile}
        onDownload={downloadFile}
      />
    </AppPage>
  );
};

export default AwardsVotePage;
