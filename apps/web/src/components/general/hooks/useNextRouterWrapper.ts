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

  // Keep the full path (including the query) so sign-in can return the user to
  // the same surface, but strip the locale segment the app hides from routes.
  const asPath = useMemo(() => {
    const rawPath = nextRouter.asPath;
    const localePrefix = nextRouter.locale ? `/${nextRouter.locale}` : "";

    if (localePrefix && rawPath.startsWith(localePrefix)) {
      const withoutLocale = rawPath.slice(localePrefix.length);
      return withoutLocale.length > 0 ? withoutLocale : "/";
    }

    return rawPath;
  }, [nextRouter.asPath, nextRouter.locale]);

  return {
    pathname,
    asPath,
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
