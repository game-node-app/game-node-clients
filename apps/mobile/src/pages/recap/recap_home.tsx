import { AppPage } from "@/components/general/AppPage";
import { blobToBase64 } from "@/util/imageUtils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useTranslation } from "@repo/locales";
import { WrappedRecapScreen } from "@repo/ui";

const RecapHomePage = () => {
  const { t } = useTranslation();

  return (
    <AppPage withMenuButton>
      <WrappedRecapScreen
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

export default RecapHomePage;
