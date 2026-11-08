import { SupporterSettingsView } from "#@/components/supporter";
import { useRouter } from "#@/util";

type SupporterCheckoutResult = "success" | "cancel";
type SupporterInterval = "monthly" | "yearly";

function parseCheckout(value: string | null): SupporterCheckoutResult | null {
  return value === "success" || value === "cancel" ? value : null;
}

function parseInterval(value: string | null): SupporterInterval | null {
  return value === "monthly" || value === "yearly" ? value : null;
}

/**
 * Supporter tab of the web settings modal. The surface itself is shared with
 * mobile; this tab only narrows the checkout result and requested interval
 * from the URL and forwards them to the view.
 */
export function SettingsPremiumTab() {
  const router = useRouter();

  return (
    <SupporterSettingsView
      checkout={parseCheckout(router.query.get("checkout"))}
      interval={parseInterval(router.query.get("interval"))}
    />
  );
}
