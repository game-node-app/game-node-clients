import { useQuery } from "@tanstack/react-query";
import { BlogPostService } from "@repo/wrapper/server";

export function useBlogPost(postId: string | undefined) {
  return useQuery({
    queryKey: ["blog", "posts", postId],
    queryFn: async () => {
      return BlogPostService.blogPostControllerFindOneByIdV1(postId!);
    },
    enabled: !!postId,
    staleTime: Infinity,
  });
}
