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
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";

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
      <ScrollableIonContent className={"ion-padding"}>
        <Stack className={"w-full mb-8 mt-3"}>
          <BlogPostsLayout>
            <BlogPostsFeed />
          </BlogPostsLayout>
        </Stack>
      </ScrollableIonContent>
    </IonPage>
  );
};

export { BlogPostsPage };
