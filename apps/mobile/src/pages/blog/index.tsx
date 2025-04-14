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
import { BlogPostsFeed } from "@repo/ui";
import { Container } from "@mantine/core";

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
      <IonContent>
        <Container fluid className={"mb-8 mt-3"}>
          <BlogPostsFeed />
        </Container>
      </IonContent>
    </IonPage>
  );
};

export { BlogPostsPage };
