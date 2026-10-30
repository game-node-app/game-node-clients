import { useQuery } from "@tanstack/react-query";
import { useI18nContext } from "@repo/locales";
import { blogTagsOptions } from "./queryOptions";
export function useBlogPostTags() {
  const { language } = useI18nContext();
  return useQuery(blogTagsOptions(language));
}
