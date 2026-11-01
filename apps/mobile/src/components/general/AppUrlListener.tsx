import { useEffect } from "react";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { useHistory } from "react-router-dom";
import { Browser } from "@capacitor/browser";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import {
  getAppUrlTarget,
  isBrowserOAuthUrl,
} from "@/components/general/getAppUrlTarget";

const getEquivalentDeepLink = (slug: string) => {
  if (slug.startsWith("/search")) {
    return "/home";
  } else if (slug.startsWith("/m/auth")) {
    return slug;
  }

  return getTabAwareHref(slug);
};

import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";

const AppUrlListener = () => {
  const { t } = useTranslation();
  const history = useHistory();

  useEffect(() => {
    const listener = App.addListener(
      "appUrlOpen",
      (event: URLOpenListenerEvent) => {
        if (isBrowserOAuthUrl(event.url)) {
          void Browser.open({ url: event.url }).catch(() => {
            notifications.show({
              color: "red",
              message: t("mcp.oauthBrowserError"),
            });
          });
          return;
        }
        const slug = getAppUrlTarget(event.url);
        if (slug == null) return;
        const url = new URL(event.url);
        if (url.pathname.startsWith("/connections/callback/")) {
          void Browser.close().catch(console.error);
        }
        history.push(getEquivalentDeepLink(slug));
      },
    );

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, [history, t]);

  return null;
};

export default AppUrlListener;
