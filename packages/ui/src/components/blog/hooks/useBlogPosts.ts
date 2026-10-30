import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useI18nContext } from "@repo/locales";
import { BlogListOptions, blogPostsOptions } from "./queryOptions";
export function useBlogPosts(dto: BlogListOptions) {
  const { language } = useI18nContext();
  const client = useQueryClient();
  const options = blogPostsOptions(dto, language);
  return {
    ...useQuery(options),
    queryKey: options.queryKey,
    invalidate: () => client.invalidateQueries({ queryKey: ["blog"] }),
  };
}
