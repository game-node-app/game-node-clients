import { useHideTabBar } from "@/components/general/hooks/useHideTabBar";
import { AppPage } from "@/components/general/AppPage";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters.ts";
import { useIonRouter } from "@ionic/react";
import { BlogPostsLayout, BlogPostsListView } from "@repo/ui";

const BlogPostsArchivePage = () => {
  useHideTabBar();
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