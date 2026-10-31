import { AppPage } from "@/components/general/AppPage";
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

  return (
    <AppPage>
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
