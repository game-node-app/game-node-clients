import { CenteredLoading, useBlogPost } from "#@/components";
import { Button, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { BlogArticleView } from "./BlogArticleView";
export function BlogPostDetailView({ postId }: { postId: string }) {
  const query = useBlogPost(postId);
  const { t } = useTranslation();
  if (query.isLoading) return <CenteredLoading />;
  if (query.isError)
    return (
      <Stack>
        <Text role="alert">
          {t(
            (query.error as { status?: number }).status === 404
              ? "blog.read.missing"
              : "blog.read.error",
          )}
        </Text>
        <Button onClick={() => query.refetch()}>{t("blog.read.retry")}</Button>
      </Stack>
    );
  if (!query.data) return <Text>{t("blog.read.missing")}</Text>;
  return <BlogArticleView post={query.data} />;
}