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
    ionRouter.push(
      getTabAwareHref(url),
      undefined,
      options?.replace ? "replace" : undefined,
    );
  };

  const pathWithoutTab = pathname.replace(`/${tabname}`, "");

  return {
    back: ionRouter.goBack,
    /**
     * Pathname is returned without tab to avoid issues when building a URL that includes the router.pathname. (e.g. duplicate tabs in URL)
     */
    pathname: pathWithoutTab,
    push: patchedPush,
    query: searchParams,
  };
}
