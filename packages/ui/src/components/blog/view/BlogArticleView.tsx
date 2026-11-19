import {
  BlogPostReviewInfo,
  BlogPostTags,
  PostImageLightboxContext,
  usePostImageLightboxContext,
  UserAvatarGroup,
} from "#@/components";
import { LANGUAGE_OPTIONS } from "#@/components/general/LanguagePickerMenu/LanguageSwitcherMenu";
import { buildPresenterComponent } from "#@/context";
import {
  Badge,
  Box,
  Button,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconArrowRight, IconLanguage } from "@tabler/icons-react";
import { BlogArticleDto, BlogPreviewDto } from "@repo/wrapper/server";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";

const BlogArticleLanguageLink = buildPresenterComponent(
  "BlogArticleLanguageLink",
  ({ href, locale, ...props }) => (
    <Button
      {...props}
      component="a"
      href={href}
      hrefLang={locale}
      lang={locale}
    />
  ),
);

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
      className="tiptap prose prose-invert max-w-full break-words [&_img]:max-w-full [&_img]:h-auto [&_img]:cursor-zoom-in"
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
  const isPreview = "status" in post;
  const isFallback = `${post.requestedLocale}` !== `${post.resolvedLocale}`;
  const otherLanguage = LANGUAGE_OPTIONS.find(
    ({ value }) =>
      value !== post.requestedLocale && post.availableLocales.includes(value),
  );
  const postPath = `/blog/post/${post.id}`;

  return (
    <Stack className="w-full items-center max-w-full">
      {isPreview && (
        <Badge>
          {post.status === "draft"
            ? t("blog.labels.draft")
            : t("blog.labels.published")}
        </Badge>
      )}
      {post.cover && (
        <Image
          src={post.cover.url}
          alt={post.cover.alt ?? ""}
          className="rounded-sm max-w-full"
        />
      )}
      <Title className="text-center p-2" lang={post.resolvedLocale}>
        {post.title}
      </Title>
      <Group className="mt-3 p-2">
        <Box className="max-w-48">
          <UserAvatarGroup userId={post.profileUserId} />
        </Box>
        {post.publishedAt && (
          <Text>{dayjs(post.publishedAt).format("DD/MM/YYYY")}</Text>
        )}
        <BlogPostTags tags={post.tags} />
      </Group>
      {(otherLanguage || isFallback) && (
        <Group justify="center" gap="xs" px="xs">
          <Group gap={6} wrap="nowrap" c="dimmed">
            <IconLanguage size={18} aria-hidden className="shrink-0" />
            <Text size="sm" role={isFallback ? "status" : undefined}>
              {t(isFallback ? "blog.read.fallback" : "blog.read.alsoAvailable")}
            </Text>
          </Group>
          {otherLanguage && (
            <BlogArticleLanguageLink
              href={
                isPreview
                  ? `?locale=${otherLanguage.value}`
                  : otherLanguage.value === "en"
                    ? postPath
                    : `/${otherLanguage.value}${postPath}`
              }
              locale={otherLanguage.value}
              variant="default"
              size="compact-sm"
              radius="xl"
              className="min-h-11"
              rightSection={<IconArrowRight size={14} aria-hidden />}
            >
              {otherLanguage.label}
            </BlogArticleLanguageLink>
          )}
        </Group>
      )}
      {post.review && <BlogPostReviewInfo reviewInfo={post.review} />}
      <Box className="lg:px-3 lg:mt-5 p-2 max-w-full">
        <PostImageLightboxContext>
          <ArticleBody content={post.content} locale={post.resolvedLocale} />
        </PostImageLightboxContext>
      </Box>
    </Stack>
  );
}
