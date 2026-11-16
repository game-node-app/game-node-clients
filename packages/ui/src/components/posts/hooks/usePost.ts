import { useQuery } from "@tanstack/react-query";
import { PostsService } from "@repo/wrapper/server";

export function usePost(
  postId: string | undefined | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["post", "detail", postId],
    queryFn: async () => {
      return PostsService.postsControllerFindOneV1(postId!);
    },
    enabled:
      (options?.enabled ?? true) && postId != undefined && postId.length > 0,
    staleTime: Infinity,
  });
}
