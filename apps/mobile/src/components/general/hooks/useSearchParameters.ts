import { useIonRouter } from "@ionic/react";
import { useMemo } from "react";

export function useSearchParameters() {
    const router = useIonRouter();

    return useMemo(() => new URLSearchParams(router.routeInfo.search), [router.routeInfo.search]);
}
