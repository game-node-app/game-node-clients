import { useQuery } from "@tanstack/react-query";
import { BlogPostService } from "@repo/wrapper/server";

export function useBlogPostTags() {
  return useQuery({
    queryKey: ["blog", "posts", "tags"],
    queryFn: () => {
      return BlogPostService.blogPostControllerFindAllTagsV1();
    },
    staleTime: Infinity,
  });
}
