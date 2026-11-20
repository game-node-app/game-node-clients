import { useIonRouterWrapper } from "@/components/general/hooks/useIonRouterWrapper";

/** Mobile has a dedicated search page, so "open search" navigates to it. */
export function useOpenGameSearch() {
  const router = useIonRouterWrapper();
  return () => void router.push("/search");
}
