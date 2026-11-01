import { useRouter } from "next/router";
import { RouterHookProps } from "@repo/ui";
import { useMemo } from "react";

export function useNextRouterWrapper(): RouterHookProps {
  const nextRouter = useRouter();

  const pathname = useMemo(() => {
    const rawPathname = nextRouter.asPath.split("?")[0];
    const localePrefix = nextRouter.locale ? `/${nextRouter.locale}` : "";

    if (localePrefix && rawPathname.startsWith(localePrefix)) {
      const normalized = rawPathname.slice(localePrefix.length);
      return normalized.length > 0 ? normalized : "/";
    }

    return rawPathname;
  }, [nextRouter.asPath, nextRouter.locale]);

  const query = useMemo(
    () => new URLSearchParams(nextRouter.asPath.split("?")[1]?.split("#")[0]),
    [nextRouter.asPath]
  );

  return {
    pathname,
    back: nextRouter.back,
    push: async (route, options) => {
      const targetMethod = options?.replace
        ? nextRouter.replace
        : nextRouter.push;

      targetMethod(route, undefined, {
        ...options,
        locale: nextRouter.locale,
      }).catch((err) => console.error(err));
    },
    query,
  };
}
