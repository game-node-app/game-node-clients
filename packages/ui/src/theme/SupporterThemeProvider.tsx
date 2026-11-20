import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ApiError, BillingService } from "@repo/wrapper/server";
import { authClient } from "#@/components/auth/authClient";
import { getSupporterStatusQueryKey } from "#@/components/supporter/hooks/supporterQueryKeys";
import {
  AppThemeProvider,
  type AppThemeProviderProps,
} from "./AppThemeProvider";

type Props = Omit<
  AppThemeProviderProps,
  "hasSupporterThemeAccess" | "restoreUnverifiedPreference"
>;

export function SupporterThemeProvider(props: Props) {
  const [isStartup, setIsStartup] = useState(true);
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const entitlement = useQuery({
    queryKey: [...getSupporterStatusQueryKey(userId), "theme"],
    queryFn: async () => {
      const { isSupporter } = await BillingService.billingControllerGetMeV1();
      if (typeof isSupporter !== "boolean") {
        throw new Error("Missing Supporter status");
      }
      return isSupporter;
    },
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    refetchOnReconnect: true,
    retry: false,
    networkMode: "always",
    meta: { persist: false },
  });
  const billingUnauthorized =
    entitlement.error instanceof ApiError && entitlement.error.status === 401;
  const signedOut =
    !userId &&
    !session.isPending &&
    (!session.error || session.error.status === 401);
  const hasVerdict =
    signedOut ||
    (!!userId && (billingUnauthorized || entitlement.data !== undefined));

  if (isStartup && hasVerdict) {
    setIsStartup(false);
  }

  return (
    <AppThemeProvider
      {...props}
      restoreUnverifiedPreference={isStartup && !hasVerdict}
      hasSupporterThemeAccess={
        !!userId && !billingUnauthorized && entitlement.data === true
      }
    />
  );
}
