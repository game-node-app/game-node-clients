import { useQuery } from "@tanstack/react-query";
import { RecapService } from "@repo/wrapper/server";

export function useRecap(userId: string, targetYear: number) {
  return useQuery({
    queryKey: ["recap", userId, targetYear],
    queryFn: async () => {
      return RecapService.recapControllerGetRecapByYearV1(userId, targetYear);
    },
  });
}
