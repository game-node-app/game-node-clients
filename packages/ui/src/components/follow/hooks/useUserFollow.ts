import { useQuery } from "@tanstack/react-query";
import { FollowService } from "../../../../../wrapper/src/server";

/**
 * Returns a UserFollow entity using it's id.
 * @param id
 */
export function useUserFollow(id: number | undefined | null) {
  return useQuery({
    queryKey: ["follow", "entity", id],
    queryFn: async () => {
      return FollowService.followControllerGetUserFollowByIdV1(id!);
    },
    enabled: !!id,
  });
}
