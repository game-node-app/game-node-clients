import {
  BlogPostReviewInfo,
  BlogPostTags,
  PostImageLightboxContext,
  usePostImageLightboxContext,
  UserAvatarGroup,
} from "#@/components";
import { PROJECT_CONTEXT } from "#@/util/projectContext";
import { Badge, Box, Group, Image, Stack, Text, Title } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { BlogArticleDto, BlogPreviewDto } from "@repo/wrapper/server";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";

function ArticleBody({ content, locale }: { content: string; locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { registerImage, unregisterImage, openLightbox } =
    usePostImageLightboxContext();
  useEffect(() => {
    const images = Array.from(ref.current?.querySelectorAll("img") ?? []);
    images.forEach((image) => {
      image.tabIndex = 0;
      image.setAttribute("role", "button");
      registerImage(image.src);
    });
    return () => images.forEach((image) => unregisterImage(image.src));
  }, [content, registerImage, unregisterImage]);
  return (
    <div
      ref={ref}
      lang={locale}
      className="tiptap prose max-w-full break-words [&_img]:max-w-full [&_img]:h-auto [&_img]:cursor-zoom-in"
      onClick={(event) => {
        if (event.target instanceof HTMLImageElement)
          openLightbox(event.target.src);
      }}
      onKeyDown={(event) => {
        if (
          event.target instanceof HTMLImageElement &&
          ["Enter", " "].includes(event.key)
        ) {
          event.preventDefault();
          openLightbox(event.target.src);
        }
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
export function BlogArticleView({
  post,
}: {
  post: BlogArticleDto | BlogPreviewDto;
}) {
  const { t } = useTranslation();
  const { setLanguage } = useI18nContext();
  return (
    <Stack className="w-full items-center max-w-full">
      {"status" in post && (
        <Badge>
          {post.status === "draft"
            ? t("blog.labels.draft")
            : t("blog.labels.published")}
        </Badge>
      )}
      {`${post.requestedLocale}` !== `${post.resolvedLocale}` && (
        <Text role="status">{t("blog.read.fallback")}</Text>
      )}
      <Group>
        {post.availableLocales.map((locale) => (
          <a
            key={locale}
            href={`${locale === "en" ? "" : "/pt-BR"}/blog/post/${post.id}`}
            hrefLang={locale}
            onClick={(event) => {
              if (PROJECT_CONTEXT?.client === "mobile") {
                event.preventDefault();
                setLanguage(locale);
              }
            }}
          >
            {locale}
          </a>
        ))}
      </Group>
      {post.cover && (
        <Image
          src={post.cover.url}
          alt={post.cover.alt ?? ""}
          className="rounded-sm max-w-full"
        />
      )}
      <Title className="text-center p-2">{post.title}</Title>
      <Group className="my-3 p-2">
        <Box className="max-w-48">
          <UserAvatarGroup userId={post.profileUserId} />
        </Box>
        {post.publishedAt && (
          <Text>{dayjs(post.publishedAt).format("DD/MM/YYYY")}</Text>
        )}
        <BlogPostTags tags={post.tags} />
      </Group>
      {post.review && <BlogPostReviewInfo reviewInfo={post.review} />}
      <Box className="lg:px-3 lg:mt-5 p-2 max-w-full">
        <PostImageLightboxContext>
          <ArticleBody content={post.content} locale={post.resolvedLocale} />
        </PostImageLightboxContext>
      </Box>
    </Stack>
  );
}