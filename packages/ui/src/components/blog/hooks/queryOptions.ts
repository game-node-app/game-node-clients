import { queryOptions } from "@tanstack/react-query";
import { BlogPostService } from "@repo/wrapper/server";
import { SupportedLanguage } from "@repo/locales";

export interface BlogListOptions {
  tag?: string;
  limit?: number;
  offset?: number;
}
export const blogPostOptions = (id: string, locale: SupportedLanguage) =>
  queryOptions({
    staleTime: 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    queryKey: ["blog", "posts", locale, id],
    queryFn: () => BlogPostService.blogPostControllerOneV1(id, locale),
  });
export const blogPostsOptions = (
  dto: BlogListOptions,
  locale: SupportedLanguage,
) =>
  queryOptions({
    staleTime: 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    queryKey: [
      "blog",
      "posts",
      locale,
      dto.tag ?? null,
      dto.limit ?? null,
      dto.offset ?? null,
    ], // null: Next cannot serialize undefined in dehydrated keys
    queryFn: () =>
      BlogPostService.blogPostControllerListV1(
        locale,
        dto.tag,
        dto.limit,
        dto.offset,
      ),
  });
export const blogTagsOptions = (locale: SupportedLanguage) =>
  queryOptions({
    staleTime: 60_000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false,
    queryKey: ["blog", "tags", locale],
    queryFn: () => BlogPostService.blogPostControllerTagsV1(locale),
  });
