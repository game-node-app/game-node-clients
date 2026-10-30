import { useQuery } from "@tanstack/react-query";
import { useI18nContext } from "@repo/locales";
import { blogPostOptions } from "./queryOptions";
export function useBlogPost(postId: string | undefined) {
  const { language } = useI18nContext();
  return useQuery({ ...blogPostOptions(postId!, language), enabled: !!postId });
}
