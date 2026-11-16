import { AppPage } from "@/components/general/AppPage";
import { blobToBase64 } from "@/util/imageUtils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useTranslation } from "@repo/locales";
import { RecapStoriesScreen } from "@repo/ui";

interface Props {
  year: number;
  userId: string;
}

const RecapStoriesPage = ({ year, userId }: Props) => {
  const { t } = useTranslation();

  return (
    <AppPage withSearch={false} contentProps={{ className: "ion-padding-0" }}>
      <RecapStoriesScreen
        userId={userId}
        year={year}
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
    </AppPage>
  );
};

export default RecapStoriesPage;
