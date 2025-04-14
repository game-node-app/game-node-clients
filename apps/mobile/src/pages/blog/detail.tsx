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
  useBlogPost,
} from "@repo/ui";

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
      <IonContent>
        <Box className={"w-full min-h-screen mb-8 mt-3"}>
          <BlogPostDetailLayout>
            <BlogPostDetailView postId={postId} />
          </BlogPostDetailLayout>
        </Box>
      </IonContent>
    </IonPage>
  );
};

export { BlogPostDetailPage };
