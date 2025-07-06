import React from "react";
import { BlogPostsLayout, BlogPostsListView } from "@repo/ui";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters.ts";
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";

const BlogPostsArchivePage = () => {
  const router = useIonRouter();
  const searchParameters = useSearchParameters();
  const tag = searchParameters.get("tag");

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot={"start"}>
            <IonBackButton />
          </IonButtons>
          <IonTitle>Blog Archive</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className={"ion-padding"}>
        <BlogPostsLayout>
          <BlogPostsListView
            tag={tag ?? undefined}
            onTagDeselect={() => {
              router.push("/blog/archive");
            }}
            stackProps={{
              className: "w-full !h-full min-h-dvh mb-8",
            }}
          />
        </BlogPostsLayout>
      </IonContent>
    </IonPage>
  );
};

export { BlogPostsArchivePage };
