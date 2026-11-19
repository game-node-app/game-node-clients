import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { Stack } from "@mantine/core";
import { BlogPostsFeed, BlogPostsLayout } from "@repo/ui";

const BlogPostsPage = () => {
  const { t } = useTranslation();
  return (
    <AppPage title={t("navigation.blog")}>
      <Stack className={"w-full mb-8 mt-3"}>
        <BlogPostsLayout>
          <BlogPostsFeed />
        </BlogPostsLayout>
      </Stack>
    </AppPage>
  );
};

export { BlogPostsPage };
