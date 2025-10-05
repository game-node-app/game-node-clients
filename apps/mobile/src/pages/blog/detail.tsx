import React from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonLoading,
  IonPage,
  IonProgressBar,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { Box, Container } from "@mantine/core";
import {
  BlogPostDetailLayout,
  BlogPostDetailView,
  BlogPostsLayout,
  useBlogPost,
} from "@repo/ui";
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { AppPage } from "@/components/general/AppPage";

interface Props {
  postId: string;
}

const BlogPostDetailPage = ({ postId }: Props) => {
  const { data, isLoading } = useBlogPost(postId);

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
