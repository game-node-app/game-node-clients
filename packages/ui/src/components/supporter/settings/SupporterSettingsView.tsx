import { useEffect, useRef, useState } from "react";
import { Anchor, Stack, Text } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { useOpenExternalUrl } from "#@/context";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useSupporterCheckout } from "../hooks/useSupporterCheckout";
import { useSupporterOffers } from "../hooks/useSupporterOffers";
import { useSupporterStatus } from "../hooks/useSupporterStatus";
import {
  DEFAULT_SUPPORTER_PREFERENCES,
  getActiveSupporterPerks,
} from "../perks/supporterPerks";
import type { SupporterInterval } from "../types";
import { getSupporterErrorKind } from "../util/supporterErrors";
import { SupportersWall } from "../wall";
import { SupporterAlwaysFreeCard } from "./SupporterAlwaysFreeCard";
import { SupporterHeroCard } from "./SupporterHeroCard";
import {
  SupporterPerksSettings,
  type SupporterPerksSettingsMode,
} from "./SupporterPerksSettings";
import { SupporterSettingsBanner } from "./SupporterSettingsBanner";
import { SupporterSubscriptionCard } from "./SupporterSubscriptionCard";

export interface SupporterSettingsViewProps {
  /** Result Stripe appended to the settings URL, if any. */
  checkout?: "success" | "cancel" | null;
  /** Interval requested by the entry link (e.g. the landing pricing CTA). */
  interval?: "monthly" | "yearly" | null;
  /** Called once a checkout session was created, before the URL is opened. */
  onCheckoutStarted?: () => void;
  /** Whether this surface renders the supporters wall itself (mobile). */
  withSupportersWall?: boolean;
}

/**
 * Shared supporter surface rendered by the web settings Supporter tab and the
 * mobile Preferences Supporter screen. Every entitlement and price comes from
 * the server; a checkout return stays unconfirmed until `/billing/me` says the
 * user is a supporter.
 */
export function SupporterSettingsView({
  checkout,
  interval,
  onCheckoutStarted,
  withSupportersWall = false,
}: SupporterSettingsViewProps) {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const userId = useUserId();
  const redirectToAuth = useRedirectToAuth();
  const openExternalUrl = useOpenExternalUrl();

  const offers = useSupporterOffers();
  const status = useSupporterStatus();
  const ownProfile = useUserProfile(userId);
  const checkoutMutation = useSupporterCheckout();

  const [selectedInterval, setSelectedInterval] =
    useState<SupporterInterval | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // A route interval seeds the selection until the user picks one explicitly.
  const activeInterval = selectedInterval ?? interval ?? "monthly";

  const isCheckoutSuccess = checkout === "success";
  const isSupporter = status.data?.isSupporter === true;
  const statusErrorKind = status.error
    ? getSupporterErrorKind(status.error)
    : null;
  const isStatusUnavailable = statusErrorKind === "unavailable";

  const preferences = ownProfile.data?.supporterPreferences ?? null;
  const billingIsSupporter = status.data?.isSupporter;
  const profileIsSupporter = ownProfile.data?.isSupporter;

  // Activation, cancellation end and restore update billing before the public
  // profile reflects them. Refresh that read once for each new mismatch so the
  // locked perks turn into working controls without a reload (design D7).
  const invalidateOwnProfile = useRef(ownProfile.invalidate);
  const lastProfileSync = useRef<string | null>(null);

  useEffect(() => {
    invalidateOwnProfile.current = ownProfile.invalidate;
  }, [ownProfile.invalidate]);

  useEffect(() => {
    if (billingIsSupporter === undefined || ownProfile.isLoading) {
      return;
    }

    const signature = `${billingIsSupporter}:${profileIsSupporter}`;

    if (lastProfileSync.current === signature) return;

    lastProfileSync.current = signature;

    if (billingIsSupporter !== profileIsSupporter) {
      invalidateOwnProfile.current();
    }
  }, [billingIsSupporter, profileIsSupporter, ownProfile.isLoading]);

  const mode: SupporterPerksSettingsMode = preferences
    ? "edit"
    : isSupporter && !ownProfile.isLoading
      ? "unavailable"
      : "locked";
  const examplePerks = getActiveSupporterPerks({
    isSupporter: true,
    supporterPreferences: DEFAULT_SUPPORTER_PREFERENCES,
  });
  const previewPerks =
    mode === "edit" ? getActiveSupporterPerks(ownProfile.data) : examplePerks;

  // A lost session belongs on the sign-in screen, not inside the tab.
  useEffect(() => {
    if (statusErrorKind === "unauthorized") {
      void redirectToAuth();
    }
  }, [statusErrorKind, redirectToAuth]);

  const handleCheckout = (nextInterval: SupporterInterval = activeInterval) => {
    if (!userId) {
      void redirectToAuth();
      return;
    }

    setCheckoutError(null);

    checkoutMutation.mutate(
      { interval: nextInterval, locale: language },
      {
        onSuccess: async ({ url }) => {
          onCheckoutStarted?.();
          await openExternalUrl(url);
        },
        onError: (error) => {
          const kind = getSupporterErrorKind(error);

          switch (kind) {
            case "conflict":
              setCheckoutError(t("supporter.errors.existingSubscription"));
              status.invalidate();
              return;
            case "unauthorized":
              void redirectToAuth();
              return;
            case "unavailable":
              setCheckoutError(t("supporter.errors.billingUnavailable"));
              return;
            case "network":
              setCheckoutError(t("supporter.errors.network"));
              return;
            default:
              setCheckoutError(t("supporter.errors.generic"));
          }
        },
      },
    );
  };

  const showPending =
    isCheckoutSuccess &&
    !!userId &&
    !isSupporter &&
    !isStatusUnavailable &&
    !checkoutError;
  const showSuccess = isCheckoutSuccess && isSupporter;
  const showCancel = checkout === "cancel";
  const hasBanner =
    showSuccess || showPending || showCancel || checkoutError !== null;
  const supportEmail = t("legal.privacy.contactEmail");

  return (
    <Stack
      gap={32}
      className={"@container w-full"}
      data-testid={"supporter-settings-view"}
    >
      {hasBanner && (
        <Stack gap={12}>
          {showSuccess && <SupporterSettingsBanner tone={"success"} />}

          {showPending && (
            <SupporterSettingsBanner
              tone={"pending"}
              onCheckAgain={() => void status.refetch()}
              isChecking={status.isFetching}
            />
          )}

          {showCancel && <SupporterSettingsBanner tone={"cancel"} />}

          {checkoutError && (
            <SupporterSettingsBanner
              tone={"error"}
              description={checkoutError}
            />
          )}
        </Stack>
      )}

      <SupporterHeroCard
        status={status.data}
        isStatusLoading={status.isLoading}
        statusErrorKind={statusErrorKind}
        onRetryStatus={() => void status.refetch()}
        offers={offers.data}
        isOffersLoading={offers.isLoading}
        isOffersError={offers.isError}
        onRetryOffers={() => void offers.refetch()}
        selectedInterval={activeInterval}
        onIntervalChange={setSelectedInterval}
        onSubscribe={handleCheckout}
        isSubscribePending={checkoutMutation.isPending}
      />

      {status.data?.isSupporter && (
        <SupporterSubscriptionCard status={status.data} />
      )}

      <SupporterPerksSettings
        mode={mode}
        prefs={preferences}
        perks={previewPerks}
        caption={
          mode === "edit"
            ? t("supporter.perks.preview.caption")
            : t("supporter.perks.preview.exampleCaption")
        }
        onWall={preferences?.showOnSupportersWall ?? null}
        supporterSince={status.data?.supporterSince ?? null}
        withSupportersWall={withSupportersWall}
        onRetry={() => ownProfile.invalidate()}
      />

      <SupporterAlwaysFreeCard />

      <Text fz={13} lh={"normal"} className={"text-[#7a7a7a]"}>
        {t("settings.premium.billingHelp")}{" "}
        <Anchor
          href={`mailto:${supportEmail}`}
          inherit
          underline={"always"}
          className={"text-[#adadad] hover:text-white"}
        >
          {supportEmail}
        </Anchor>
        .
      </Text>

      {withSupportersWall && <SupportersWall variant={"settings"} />}
    </Stack>
  );
}
