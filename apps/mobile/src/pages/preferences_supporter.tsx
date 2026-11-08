import { AppPage } from "@/components/general/AppPage";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import { useSupporterCheckoutTracking } from "@/components/supporter/useSupporterCheckoutTracking";
import { useTranslation } from "@repo/locales";
import { SessionAuth, SupporterSettingsView } from "@repo/ui";

type SupporterCheckoutResult = "success" | "cancel";
type SupporterInterval = "monthly" | "yearly";

function parseCheckout(value: string | null): SupporterCheckoutResult | null {
  return value === "success" || value === "cancel" ? value : null;
}

function parseInterval(value: string | null): SupporterInterval | null {
  return value === "monthly" || value === "yearly" ? value : null;
}

/**
 * Mobile host for the shared supporter settings view. Preferences requires an
 * account, and so does subscribing, so the screen sits behind `SessionAuth`
 * like the rest of Preferences. The App Link for a Stripe return arrives as
 * `…/?checkout=…`; the route result wins over the local pending state raised
 * when the native browser sheet closes.
 */
const PreferencesSupporterPage = () => {
  const { t } = useTranslation();
  const query = useSearchParameters();
  const { pendingCheckout, onCheckoutStarted } = useSupporterCheckoutTracking();

  const routeCheckout = parseCheckout(query.get("checkout"));
  const checkout = routeCheckout ?? (pendingCheckout ? "success" : null);

  return (
    <AppPage withSearch={false} title={t("settings.tabs.premium.title")}>
      <SessionAuth>
        <SupporterSettingsView
          checkout={checkout}
          interval={parseInterval(query.get("interval"))}
          onCheckoutStarted={onCheckoutStarted}
        />
      </SessionAuth>
    </AppPage>
  );
};

export default PreferencesSupporterPage;
