import { useTranslation } from "@repo/locales";
import { McpGuideScreen } from "@repo/ui";
import { OpenGraph } from "@/components/general/OpenGraph";

export default function McpPage() {
  const { t } = useTranslation();
  return (
    <>
      <OpenGraph
        title={t("seo.mcp.title")}
        description={t("seo.mcp.description")}
      />
      <McpGuideScreen />
    </>
  );
}
