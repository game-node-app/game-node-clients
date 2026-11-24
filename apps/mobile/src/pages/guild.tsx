import { AppPage } from "@/components/general/AppPage";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import { useTranslation } from "@repo/locales";
import { GuildView } from "@repo/ui";

const GUILD_TABS = ["board", "accepted", "completed"] as const;

type GuildTab = (typeof GUILD_TABS)[number];

function isGuildTab(value: string | null): value is GuildTab {
  return value !== null && (GUILD_TABS as readonly string[]).includes(value);
}

const GuildPage = () => {
  const { t } = useTranslation();
  const searchParameters = useSearchParameters();
  const tab = searchParameters.get("tab");

  return (
    <AppPage title={t("navigation.guild")} withSearch={false}>
      <GuildView
        supporterHref="/preferences/supporter"
        initialTab={isGuildTab(tab) ? tab : undefined}
      />
    </AppPage>
  );
};

export default GuildPage;
