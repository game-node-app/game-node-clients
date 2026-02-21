import { useQuery } from "@tanstack/react-query";
import { RecapService } from "@repo/wrapper/server";

/**
 * Given a userID, returns the recap status for the current year.
 * This includes whether the recap is created and if the user is eligible for the recap.
 * The eligibility is determined by the user's account creation date and the target year.
 * @param userId
 * @param year
 */
export function useRecapStatus(
  userId: string | undefined,
  year: number | undefined,
) {
  return useQuery({
    queryKey: ["recap", "status", userId, year],
    queryFn: async () => {
      return RecapService.recapControllerGetRecapStatusV1(userId!, year!);
    },
    enabled: userId != undefined && year != undefined,
  });
}
