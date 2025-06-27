import React from "react";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { BlogPostsFeed, BlogPostsLayout } from "@repo/ui";
import { Container, Stack } from "@mantine/core";

const BlogPostsPage = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonTitle>Blog Posts</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className={"ion-padding"}>
        <Stack className={"w-full mb-8 mt-3"}>
          <BlogPostsLayout>
            <BlogPostsFeed />
          </BlogPostsLayout>
        </Stack>
      </IonContent>
    </IonPage>
  );
};

export { BlogPostsPage };
