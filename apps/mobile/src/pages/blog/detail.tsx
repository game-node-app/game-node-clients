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

interface Props {
  postId: string;
}

const BlogPostDetailPage = ({ postId }: Props) => {
  const { data, isLoading } = useBlogPost(postId);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          {data != undefined && <IonTitle>{data.title}</IonTitle>}
          {isLoading && <IonProgressBar type="indeterminate" />}
        </IonToolbar>
      </IonHeader>
      <ScrollableIonContent className="ion-padding">
        <Box className={"w-full min-h-screen mb-8 mt-3"}>
          <BlogPostsLayout>
            <BlogPostDetailLayout>
              <BlogPostDetailView postId={postId} />
            </BlogPostDetailLayout>
          </BlogPostsLayout>
        </Box>
      </ScrollableIonContent>
    </IonPage>
  );
};

export { BlogPostDetailPage };
