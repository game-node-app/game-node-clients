import React from "react";
import { useRouter } from "next/router";
import { OpenGraph } from "../../../../components/general/OpenGraph";
import { Button, Stack, Text } from "@mantine/core";
import {
  BlogPostDetailLayout,
  BlogPostDetailView,
  BlogPostsLayout,
  blogPostOptions,
  useBlogPost,
} from "@repo/ui";
import { BlogArticleDto } from "@repo/wrapper/server";
import { GetServerSidePropsContext } from "next";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { SupportedLanguage, useTranslation } from "@repo/locales";
import { fetchSeoProfile, localizedUrl, SITE_URL } from "../../../../util/seo";

export const getServerSideProps = async ({
  params,
  locale,
  res,
}: GetServerSidePropsContext) => {
  const client = new QueryClient();
  try {
    const post = await client.fetchQuery(
      blogPostOptions(
        params!.postId as string,
        (locale ?? "en") as SupportedLanguage,
      ),
    );
    const author = await fetchSeoProfile(post.profileUserId);
    return {
      props: {
        dehydratedState: dehydrate(client),
        unavailable: false,
        authorName: author?.username ?? null,
      },
    };
  } catch (error) {
    if ((error as { status?: number }).status === 404)
      return { notFound: true };
    res.statusCode = 503;
    return { props: { unavailable: true } };
  }
};

/** schema.org `BlogPosting` of a post. */
function blogPostingJsonLd(post: BlogArticleDto, authorName: string | null) {
  const url = localizedUrl(post.resolvedLocale, `/blog/post/${post.id}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: url,
    inLanguage: post.resolvedLocale,
    ...(post.cover?.url ? { image: [post.cover.url] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.tags?.length
      ? { keywords: post.tags.map((tag) => tag.name) }
      : {}),
    ...(authorName
      ? {
          author: {
            "@type": "Person",
            name: authorName,
            url: `${SITE_URL}/profile/${post.profileUserId}`,
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "GameNode",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/img/og_image.jpg` },
    },
  };
}

export default function BlogPostDetailPage({
  unavailable = false,
  authorName = null,
}: {
  unavailable?: boolean;
  authorName?: string | null;
}) {
  const { query } = useRouter();
  const { t } = useTranslation();
  const postId = query.postId as string;
  const { data: post } = useBlogPost(unavailable ? undefined : postId);
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
        <OpenGraph
          title={post.title}
          description={post.excerpt}
          imageUrl={post.cover?.url}
          imageAlt={post.cover?.alt}
          wideImage
          type="article"
          publishedTime={post.publishedAt}
          locales={post.availableLocales}
          contentLocale={post.resolvedLocale}
          jsonLd={blogPostingJsonLd(post, authorName)}
        />
      )}
      <BlogPostsLayout>
        <BlogPostDetailLayout postId={postId}>
          <BlogPostDetailView postId={postId} />
        </BlogPostDetailLayout>
      </BlogPostsLayout>
    </Stack>
  );
}
