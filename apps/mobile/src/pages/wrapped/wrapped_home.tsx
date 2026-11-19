import { AppPage } from "@/components/general/AppPage";
import { blobToBase64 } from "@/util/imageUtils";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { useTranslation } from "@repo/locales";
import { SessionAuth, WrappedRecapScreen, type RecapPeriod } from "@repo/ui";
import { useLocation } from "react-router-dom";

const RECAP_PERIODS: RecapPeriod[] = ["week", "month", "year"];

const WrappedHomePage = () => {
  const { t } = useTranslation();
  // `?period=year` comes from the home screen widgets, which summarise the last 12 months.
  const requested = new URLSearchParams(useLocation().search).get("period");
  const initialPeriod = RECAP_PERIODS.find((period) => period === requested);

  return (
    <AppPage title={t("navigation.wrapped")} withMenuButton>
      <SessionAuth>
        <WrappedRecapScreen
          initialPeriod={initialPeriod}
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
      </SessionAuth>
    </AppPage>
  );
};

export default WrappedHomePage;
