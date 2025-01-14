import { useQuery } from "@tanstack/react-query";
import { FollowService } from "@repo/wrapper/server";

/**
 * Returns a UserFollow entity using it's id.
 * @param id
 */
export function useUserFollow(id: number) {
  return useQuery({
    queryKey: ["follow", "entity", id],
    queryFn: async () => {
      return FollowService.followControllerGetUserFollowByIdV1(id);
    },
  });
}
