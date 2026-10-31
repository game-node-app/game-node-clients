import { PropsWithChildren, useEffect } from "react";
import { PostHogProvider as OriginalProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { usePostHogUserListener } from "#@/hooks/usePostHogUserListener";

import { beforeOAuthCapture, isPrivateAuthUrl } from "./oauthPrivacy";

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
    if (posthogKey && posthogHost) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        ui_host: "https://app.posthog.com",
        defaults: "2025-05-24",
        debug: enableDebug,
        before_send: beforeOAuthCapture,
        autocapture: !isPrivateAuthUrl(window.location.href),
        disable_session_recording: isPrivateAuthUrl(window.location.href),
        session_recording: {
          blockSelector: ".oauth-private",
          maskCapturedNetworkRequestFn: (request) =>
            isPrivateAuthUrl(window.location.href) ||
            isPrivateAuthUrl(request.name)
              ? null
              : request,
        },
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
