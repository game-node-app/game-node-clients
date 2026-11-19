import React from "react";
import { Stack } from "@mantine/core";
import {
  BLOG_CATEGORY_POSTS_LIMIT,
  BLOG_FEATURED_POSTS_LIMIT,
  BlogPostsFeed,
  BlogPostsLayout,
  blogPostsOptions,
  blogTagsOptions,
} from "@repo/ui";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { SupportedLanguage, useTranslation } from "@repo/locales";
import type { GetServerSidePropsContext } from "next";
import { OpenGraph } from "../../components/general/OpenGraph";

export const getServerSideProps = async ({
  locale,
}: GetServerSidePropsContext) => {
  const queryClient = new QueryClient();
  const language = (locale ?? "en") as SupportedLanguage;
  const tagsQuery = blogTagsOptions(language);
  await Promise.all([
    queryClient.prefetchQuery(
      blogPostsOptions({ limit: BLOG_FEATURED_POSTS_LIMIT }, language),
    ),
    queryClient
      .prefetchQuery(tagsQuery)
      .then(() =>
        Promise.all(
          (queryClient.getQueryData(tagsQuery.queryKey) ?? []).map(({ id }) =>
            queryClient.prefetchQuery(
              blogPostsOptions(
                { tag: id, limit: BLOG_CATEGORY_POSTS_LIMIT },
                language,
              ),
            ),
          ),
        ),
      ),
  ]);

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

const BlogLandingPage = () => {
  const { t } = useTranslation();
  return (
    <Stack className="mx-auto lg:px-4 lg:py-8">
      <OpenGraph
        title={t("seo.blog.title")}
        description={t("seo.blog.description")}
      />
      <BlogPostsLayout>
        <BlogPostsFeed />
      </BlogPostsLayout>
    </Stack>
  );
};

export default BlogLandingPage;
