import { Browser } from "@capacitor/browser";
import { useTranslation } from "@repo/locales";
import { McpGuideScreen } from "@repo/ui";
import { AppPage } from "@/components/general/AppPage";

export default function McpPage() {
  const { t } = useTranslation();
  return (
    <AppPage title={t("mcp.title")} withSearch={false}>
      <McpGuideScreen
        openExternal={async (url) => {
          await Browser.open({ url });
        }}
      />
    </AppPage>
  );
}
