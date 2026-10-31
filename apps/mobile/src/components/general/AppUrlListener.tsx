import { useEffect } from "react";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { useHistory } from "react-router-dom";
import { Browser } from "@capacitor/browser";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { getAppUrlTarget } from "@/components/general/getAppUrlTarget";

const getEquivalentDeepLink = (slug: string) => {
  if (slug.startsWith("/search")) {
    return "/home";
  } else if (slug.startsWith("/m/auth")) {
    return slug;
  }

  return getTabAwareHref(slug);
};

const AppUrlListener = () => {
  const history = useHistory();

  useEffect(() => {
    const listener = App.addListener(
      "appUrlOpen",
      (event: URLOpenListenerEvent) => {
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
  }, [history]);

  return null;
};

export default AppUrlListener;
