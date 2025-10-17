import React, { PropsWithChildren, useEffect } from "react";
import { PostHogProvider as OriginalProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { usePostHogUserListener } from "#@/hooks/usePostHogUserListener";

interface Props extends PropsWithChildren {
  appName: string;
  posthogKey: string;
  posthogHost: string;
  enableDebug?: boolean;
}

const PostHogProvider = ({
  appName,
  posthogKey,
  posthogHost,
  enableDebug = false,
  children,
}: Props) => {
  usePostHogUserListener();

  useEffect(() => {
    if (posthogHost && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        ui_host: "https://app.posthog.com",
        defaults: "2025-05-24",
        debug: enableDebug,
      });
      posthog.register({ app_name: appName });
    } else {
      console.warn(
        "PostHog key or host not set. Analytics functionality will not be available.",
      );
    }
  }, [appName, enableDebug, posthogHost, posthogKey]);

  return <OriginalProvider client={posthog}>{children}</OriginalProvider>;
};

export { PostHogProvider };
