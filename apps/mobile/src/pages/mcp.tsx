import { Browser } from "@capacitor/browser";
import { McpGuideScreen } from "@repo/ui";
import { AppPage } from "@/components/general/AppPage";

export default function McpPage() {
  return (
    <AppPage withSearch={false}>
      <McpGuideScreen
        openExternal={async (url) => {
          await Browser.open({ url });
        }}
      />
    </AppPage>
  );
}
