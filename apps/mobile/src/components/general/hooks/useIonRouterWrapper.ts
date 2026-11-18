import { useIonRouter } from "@ionic/react";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { RouterHookProps } from "@repo/ui";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters.ts";

export function useIonRouterWrapper(): RouterHookProps {
  const ionRouter = useIonRouter();
  const searchParams = useSearchParameters();

  const pathname = ionRouter.routeInfo.pathname;

  const tabname = pathname.split("/")[1];

  const patchedPush: RouterHookProps["push"] = async (url, options) => {
    // A query-only update on a tab root keeps its canonical Ionic path.
    const target =
      !url || url.startsWith("?") ? `${pathname}${url}` : getTabAwareHref(url);

    ionRouter.push(
      options?.absolute ? url : target,
      undefined,
      options?.replace ? "replace" : undefined,
    );
  };

  const pathWithoutTab = pathname.replace(`/${tabname}`, "");

  return {
    asPath: `${ionRouter.routeInfo.pathname}${ionRouter.routeInfo.search}`,
    back: ionRouter.goBack,
    /**
     * Pathname is returned without tab to avoid issues when building a URL that includes the router.pathname. (e.g. duplicate tabs in URL)
     */
    pathname: pathWithoutTab,
    push: patchedPush,
    query: searchParams,
  };
}
