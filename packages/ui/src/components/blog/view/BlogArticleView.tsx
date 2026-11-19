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
  Menu,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  DEFAULT_LANGUAGE,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
  useTranslation,
} from "@repo/locales";
import {
  IconArrowRight,
  IconChevronDown,
  IconLanguage,
} from "@tabler/icons-react";
import { BlogArticleDto, BlogPreviewDto } from "@repo/wrapper/server";
import dayjs from "dayjs";
import { useEffect, useRef } from "react";

const BlogArticleLanguageLink = buildPresenterComponent(
  "BlogArticleLanguageLink",
  ({ href, locale, render }) =>
    render({ component: "a", href, hrefLang: locale, lang: locale }),
);

function getLanguageLabel(locale: SupportedLanguage) {
  const label = LANGUAGE_OPTIONS.find(({ value }) => value === locale)?.label;
  if (label || typeof Intl.DisplayNames !== "function") return label ?? locale;

  const name = new Intl.DisplayNames(locale, { type: "language" }).of(locale);
  return name
    ? name.charAt(0).toLocaleUpperCase(locale) + name.slice(1)
    : locale;
}

function BlogArticleLanguages({
  post,
}: {
  post: BlogArticleDto | BlogPreviewDto;
}) {
  const { t } = useTranslation();
  const requestedLocale: SupportedLanguage = post.requestedLocale;
  const isFallback = requestedLocale !== post.resolvedLocale;
  const publishedLocales = new Set<string>(post.availableLocales);
  const postPath = `/blog/post/${post.id}`;
  const languages = SUPPORTED_LANGUAGES.filter(
    (locale) => locale !== requestedLocale && publishedLocales.has(locale),
  ).map((locale) => ({
    locale,
    label: getLanguageLabel(locale),
    href:
      "status" in post
        ? `?locale=${locale}`
        : `${locale === DEFAULT_LANGUAGE ? "" : `/${locale}`}${postPath}`,
  }));
  const [firstLanguage] = languages;
  const hasMultipleLanguages = languages.length > 1;

  if (!firstLanguage && !isFallback) return null;

  return (
    <Group justify="center" gap="xs" px="xs" className="max-w-full">
      {(isFallback || !hasMultipleLanguages) && (
        <Group gap={6} wrap="nowrap" c="dimmed">
          {!hasMultipleLanguages && (
            <IconLanguage size={18} aria-hidden className="shrink-0" />
          )}
          <Text size="sm" role={isFallback ? "status" : undefined}>
            {t(isFallback ? "blog.read.fallback" : "blog.read.alsoAvailable")}
          </Text>
        </Group>
      )}
      {firstLanguage && !hasMultipleLanguages && (
        <BlogArticleLanguageLink
          href={firstLanguage.href}
          locale={firstLanguage.locale}
          render={(props) => (
            <Button
              {...props}
              variant="default"
              size="compact-sm"
              radius="xl"
              className="min-h-11"
              rightSection={<IconArrowRight size={14} aria-hidden />}
            >
              <bdi>{firstLanguage.label}</bdi>
            </Button>
          )}
        />
      )}
      {hasMultipleLanguages && (
        <Menu position="bottom" width={224} offset={6} radius="md" returnFocus>
          <Menu.Target>
            <Button
              variant="default"
              size="compact-sm"
              radius="xl"
              className="min-h-11"
              leftSection={<IconLanguage size={16} aria-hidden />}
              rightSection={<IconChevronDown size={14} aria-hidden />}
            >
              {t("blog.read.chooseLanguage")}
            </Button>
          </Menu.Target>
          <Menu.Dropdown className="max-h-64 overflow-y-auto overscroll-contain">
            {languages.map(({ locale, href, label }) => (
              <BlogArticleLanguageLink
                key={locale}
                href={href}
                locale={locale}
                render={(props) => (
                  <Menu.Item {...props} className="min-h-11">
                    <bdi>{label}</bdi>
                  </Menu.Item>
                )}
              />
            ))}
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
}

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
      <BlogArticleLanguages post={post} />
      {post.review && <BlogPostReviewInfo reviewInfo={post.review} />}
      <Box className="lg:px-3 lg:mt-5 p-2 max-w-full">
        <PostImageLightboxContext>
          <ArticleBody content={post.content} locale={post.resolvedLocale} />
        </PostImageLightboxContext>
      </Box>
    </Stack>
  );
}
