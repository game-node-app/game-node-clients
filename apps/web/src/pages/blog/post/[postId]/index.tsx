import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Button, Stack, Text } from "@mantine/core";
import {
  BlogPostDetailLayout,
  BlogPostDetailView,
  BlogPostsLayout,
  blogPostOptions,
  useBlogPost,
} from "@repo/ui";
import { GetServerSidePropsContext } from "next";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { SupportedLanguage, useTranslation } from "@repo/locales";

export const getServerSideProps = async ({
  params,
  locale,
  res,
}: GetServerSidePropsContext) => {
  const client = new QueryClient();
  try {
    await client.fetchQuery(
      blogPostOptions(
        params!.postId as string,
        (locale ?? "en") as SupportedLanguage,
      ),
    );
    return {
      props: { dehydratedState: dehydrate(client), unavailable: false },
    };
  } catch (error) {
    if ((error as { status?: number }).status === 404)
      return { notFound: true };
    res.statusCode = 503;
    return { props: { unavailable: true } };
  }
};
export default function BlogPostDetailPage({
  unavailable = false,
}: {
  unavailable?: boolean;
}) {
  const { query } = useRouter();
  const { t } = useTranslation();
  const postId = query.postId as string;
  const { data: post } = useBlogPost(unavailable ? undefined : postId);
  const articleUrl = (locale: string) =>
    `${process.env.NEXT_PUBLIC_DOMAIN_WEBSITE}${locale === "en" ? "" : `/${locale}`}/blog/post/${postId}`;
  if (unavailable)
    return (
      <Stack>
        <Text role="alert">{t("blog.read.error")}</Text>
        <Button onClick={() => window.location.reload()}>
          {t("blog.read.retry")}
        </Button>
      </Stack>
    );
  return (
    <Stack className="w-full items-center">
      {post && (
        <Head>
          <title>{post.title}</title>
          <meta name="description" content={post.excerpt} />
          <meta
            property="og:locale"
            content={post.resolvedLocale.replace("-", "_")}
          />
          <link rel="canonical" href={articleUrl(post.resolvedLocale)} />
          {post.availableLocales.map((locale) => (
            <link
              key={locale}
              rel="alternate"
              hrefLang={locale}
              href={articleUrl(locale)}
            />
          ))}
        </Head>
      )}
      <BlogPostsLayout>
        <BlogPostDetailLayout postId={postId}>
          <BlogPostDetailView postId={postId} />
        </BlogPostDetailLayout>
      </BlogPostsLayout>
    </Stack>
  );
}
