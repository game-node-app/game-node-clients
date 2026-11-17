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
  /** Send events as plain JSON. Needed where fetch is patched to native HTTP, which corrupts gzip bodies. */
  disableCompression?: boolean;
}

const PostHogProvider = ({
  appName,
  posthogKey,
  posthogHost,
  enableDebug = false,
  disableCompression = false,
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
        disable_compression: disableCompression,
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
  }, [appName, disableCompression, enableDebug, posthogHost, posthogKey]);

  return <OriginalProvider client={posthog}>{children}</OriginalProvider>;
};

export { PostHogProvider };
