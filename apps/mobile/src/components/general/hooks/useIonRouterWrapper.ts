import { useIonRouter, UseIonRouterResult } from "@ionic/react";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { RoutingManagerProps } from "@repo/ui";

export function useIonRouterWrapper(): RoutingManagerProps {
  const originalMethod = useIonRouter();

  const patchedPush: UseIonRouterResult["push"] = (pathname, ...args) => {
    return originalMethod.push(getTabAwareHref(pathname), ...args);
  };

  return {
    push: patchedPush,
  };
}
