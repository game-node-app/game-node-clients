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
import { ScrollableIonContent } from "@/components/general/ScrollableIonContent.tsx";
import { AppPage } from "@/components/general/AppPage";

const BlogPostsArchivePage = () => {
  const router = useIonRouter();
  const searchParameters = useSearchParameters();
  const tag = searchParameters.get("tag");

  return (
    <AppPage>
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
    </AppPage>
  );
};

export { BlogPostsArchivePage };
