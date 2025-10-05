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
import { AppPage } from "@/components/general/AppPage";

const BlogPostsPage = () => {
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
