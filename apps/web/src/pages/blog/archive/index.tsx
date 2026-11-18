import React from "react";
import { BlogPostsLayout, BlogPostsListView } from "@repo/ui";
import { useRouter } from "next/router";
import { useTranslation } from "@repo/locales";
import { OpenGraph } from "@/components/general/OpenGraph";
import { getCapitalizedText } from "@/util/getCapitalizedText";

/** Rendered per request so the route parameters reach the page's metadata. */
export const getServerSideProps = async () => ({ props: {} });

const BlogPostArchivePage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { tag } = router.query;

  return (
    <BlogPostsLayout>
      <OpenGraph
        title={
          typeof tag === "string"
            ? t("seo.blog.taggedTitle", { tag: getCapitalizedText(tag) })
            : t("seo.blog.archiveTitle")
        }
        description={t("seo.blog.description")}
      />
      <BlogPostsListView
        tag={tag as string | undefined}
        onTagDeselect={() => {
          router.push("/blog/archive");
        }}
        stackProps={{
          className: "w-full !h-full min-h-dvh mb-8",
        }}
      />
    </BlogPostsLayout>
  );
};

export default BlogPostArchivePage;
