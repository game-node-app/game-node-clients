import { useIonRouter, UseIonRouterResult } from "@ionic/react";
import { getTabAwareHref } from "@/util/getTabAwareHref";

export function useIonRouterWrapper(): UseIonRouterResult {
    const originalMethod = useIonRouter();

    const patchedPush: UseIonRouterResult["push"] = (pathname, ...args) => {
        return originalMethod.push(getTabAwareHref(pathname), ...args);
    };

    return {
        ...originalMethod,
        push: patchedPush,
    };
}
