import { AppPage } from "@/components/general/AppPage";
import { BlogPostsLayout, BlogPostsListView, useRouter } from "@repo/ui";

const BlogPostsArchivePage = () => {
  const router = useRouter();
  const tag = router.query?.get("tag");

  return (
    <AppPage>
      <BlogPostsLayout>
        <BlogPostsListView
          tag={tag ?? undefined}
          onTagDeselect={() => {
            router.push("/blog/archive", { replace: true });
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
