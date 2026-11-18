import { useHideTabBar } from "@/components/general/hooks/useHideTabBar";
import { AppPage } from "@/components/general/AppPage";
import { Stack } from "@mantine/core";
import { BlogPostsFeed, BlogPostsLayout } from "@repo/ui";

const BlogPostsPage = () => {
  useHideTabBar();
  return (
    <AppPage>
      <Stack className={"w-full mb-8 mt-3"}>
        <BlogPostsLayout>
          <BlogPostsFeed />
        </BlogPostsLayout>
      </Stack>
    </AppPage>
  );
};

export { BlogPostsPage };