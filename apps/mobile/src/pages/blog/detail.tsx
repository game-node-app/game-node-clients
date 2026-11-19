import { AppPage } from "@/components/general/AppPage";
import { useTranslation } from "@repo/locales";
import { Box } from "@mantine/core";
import {
  BlogPostDetailLayout,
  BlogPostDetailView,
  BlogPostsLayout,
} from "@repo/ui";

interface Props {
  postId: string;
}

const BlogPostDetailPage = ({ postId }: Props) => {
  const { t } = useTranslation();
  return (
    <AppPage title={t("navigation.blog")}>
      <Box className={"w-full min-h-screen mb-8 mt-3"}>
        <BlogPostsLayout>
          <BlogPostDetailLayout postId={postId}>
            <BlogPostDetailView postId={postId} />
          </BlogPostDetailLayout>
        </BlogPostsLayout>
      </Box>
    </AppPage>
  );
};

export { BlogPostDetailPage };
