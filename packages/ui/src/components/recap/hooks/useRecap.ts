import { useQuery } from "@tanstack/react-query";
import { RecapService } from "@repo/wrapper/server";
import {
  buildMockRecap,
  isMockRecap,
} from "#@/components/recap/hooks/mockRecap";

export function useRecap(userId: string, targetYear: number) {
  return useQuery({
    queryKey: ["recap", userId, targetYear],
    queryFn: async () => {
      if (isMockRecap(userId)) return buildMockRecap(userId, targetYear);
      return RecapService.recapControllerGetRecapByYearV1(userId, targetYear);
    },
  });
}
