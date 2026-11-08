import { useState } from "react";
import { UseMutationResult } from "@tanstack/react-query";
import {
  ApiError,
  BillingPortalResponseDto,
  BillingSubscriptionActionResponseDto,
} from "@repo/wrapper/server";
import { useI18nContext, useTranslation } from "@repo/locales";
import { useOpenExternalUrl } from "#@/context";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import type { SupporterErrorKind, SupporterPortalVariables } from "../types";
import { getSupporterErrorKind } from "../util/supporterErrors";
import { useSupporterManagement } from "./useSupporterManagement";
import { useSupporterStatus } from "./useSupporterStatus";

export interface UseSupporterActionsOptions {
  /** Called after the server confirms a cancellation (e.g. to close the dialog). */
  onCancelSuccess?: () => void;
}

export interface UseSupporterActionsResult {
  portal: UseMutationResult<
    BillingPortalResponseDto,
    ApiError,
    SupporterPortalVariables
  >;
  cancel: UseMutationResult<
    BillingSubscriptionActionResponseDto,
    ApiError,
    void
  >;
  restore: UseMutationResult<
    BillingSubscriptionActionResponseDto,
    ApiError,
    void
  >;
  /** Inline error from the portal or restore action. */
  actionError: string | null;
  /** Inline error shown inside the cancellation dialog. */
  cancelError: string | null;
  clearActionError: () => void;
  clearCancelError: () => void;
  manageBilling: () => void;
  restoreSubscription: () => void;
  cancelSubscription: () => void;
  isPortalPending: boolean;
  isCancelPending: boolean;
  isRestorePending: boolean;
  isAnyPending: boolean;
}

const actionErrorMessageKeys = {
  unauthorized: null,
  notFound: "supporter.errors.noSubscription",
  conflict: "supporter.errors.noPendingCancellation",
  unavailable: "supporter.errors.billingUnavailable",
  network: "supporter.errors.network",
  unknown: "supporter.errors.generic",
} as const;

/**
 * Portal, cancel and restore handlers with the billing error mapping shared by
 * the supporter settings cards. Billing failures stay inline on the surface;
 * only a lost session leaves it for the sign-in screen.
 */
export function useSupporterActions(
  options: UseSupporterActionsOptions = {},
): UseSupporterActionsResult {
  const { t } = useTranslation();
  const { language } = useI18nContext();
  const openExternalUrl = useOpenExternalUrl();
  const redirectToAuth = useRedirectToAuth();
  const status = useSupporterStatus();
  const management = useSupporterManagement();

  const actionError = useActionErrorState();
  const cancelError = useActionErrorState();

  const handleUnauthorized = (kind: SupporterErrorKind) => {
    if (kind !== "unauthorized") return false;

    void redirectToAuth();
    return true;
  };

  const handleManageBillingError = (error: unknown) => {
    const kind = getSupporterErrorKind(error);

    if (handleUnauthorized(kind)) return;

    if (kind === "notFound") status.invalidate();

    actionError.set(
      t(actionErrorMessageKeys[kind] ?? actionErrorMessageKeys.unknown),
    );
  };

  const handleRestoreError = (error: unknown) => {
    const kind = getSupporterErrorKind(error);

    if (handleUnauthorized(kind)) return;

    if (kind === "notFound") status.invalidate();

    actionError.set(
      t(actionErrorMessageKeys[kind] ?? actionErrorMessageKeys.unknown),
    );
  };

  const handleCancelError = (error: unknown) => {
    const kind = getSupporterErrorKind(error);

    if (handleUnauthorized(kind)) return;

    if (kind === "notFound") status.invalidate();

    cancelError.set(
      t(actionErrorMessageKeys[kind] ?? actionErrorMessageKeys.unknown),
    );
  };

  const manageBilling = () => {
    actionError.clear();

    management.portal.mutate(
      { locale: language },
      {
        onSuccess: async ({ url }) => {
          await openExternalUrl(url);
        },
        onError: handleManageBillingError,
      },
    );
  };

  const restoreSubscription = () => {
    actionError.clear();

    management.restore.mutate(undefined, {
      onError: handleRestoreError,
    });
  };

  const cancelSubscription = () => {
    cancelError.clear();

    management.cancel.mutate(undefined, {
      onSuccess: () => {
        options.onCancelSuccess?.();
      },
      onError: handleCancelError,
    });
  };

  return {
    portal: management.portal,
    cancel: management.cancel,
    restore: management.restore,
    actionError: actionError.value,
    cancelError: cancelError.value,
    clearActionError: actionError.clear,
    clearCancelError: cancelError.clear,
    manageBilling,
    restoreSubscription,
    cancelSubscription,
    isPortalPending: management.portal.isPending,
    isCancelPending: management.cancel.isPending,
    isRestorePending: management.restore.isPending,
    isAnyPending:
      management.portal.isPending ||
      management.cancel.isPending ||
      management.restore.isPending,
  };
}

/** Tiny shared state holder so portal/restore and cancel errors stay separate. */
function useActionErrorState() {
  const [value, setValue] = useState<string | null>(null);

  return {
    value,
    set: setValue,
    clear: () => setValue(null),
  };
}
