import { useRouter } from "next/router";
import { RouterHookProps } from "@repo/ui";
import { useMemo } from "react";

export function useNextRouterWrapper(): RouterHookProps {
  const nextRouter = useRouter();

  const patchedPush: RouterHookProps["push"] = async (route, options) => {
    const targetMethod = options?.replace
      ? nextRouter.replace
      : nextRouter.push;

    targetMethod(route, undefined, options).catch((err) => console.error(err));
  };

  // Transform NextRouter's `query` object into a `URLSearchParams` instance
  const query = useMemo(() => {
    const searchParams = new URLSearchParams();
    for (const key in nextRouter.query) {
      const value = nextRouter.query[key];
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else if (value !== undefined) {
        searchParams.append(key, value as string);
      }
    }
    return searchParams;
  }, [nextRouter.query]);

  return {
    pathname: nextRouter.asPath.split("?")[0],
    back: nextRouter.back,
    push: patchedPush,
    query,
  };
}
