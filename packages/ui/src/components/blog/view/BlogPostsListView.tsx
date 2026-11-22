import {
  BlogPostCard,
  CenteredErrorMessage,
  CenteredLoading,
  DetailsBox,
  DetailsBoxProps,
  GameViewPagination,
  useBlogCategories,
  useBlogPosts,
} from "#@/components";
import {
  getCapitalizedText,
  getErrorMessage,
  getOffsetAsPage,
  getPageAsOffset,
  Link,
} from "#@/util";
import { Badge, Box, Button, Center, Text } from "@mantine/core";
import { useI18nContext, useTranslation } from "@repo/locales";
import { IconX } from "@tabler/icons-react";
import { useMemo, useState } from "react";

interface Props extends Omit<DetailsBoxProps, "title"> {
  tag: string | undefined;
  onTagDeselect: () => void;
}

const DEFAULT_LIMIT = 20;

const BlogPostsListView = ({ tag, onTagDeselect, ...others }: Props) => {
  const { t } = useTranslation();
  const categories = useBlogCategories();
  const tagTitle =
    categories.find(({ id }) => id === tag)?.title ??
    (tag ? getCapitalizedText(tag) : undefined);
  const [offset, setOffset] = useState(0);
  const { language } = useI18nContext();
  const [filter, setFilter] = useState({ tag, language });
  if (filter.tag !== tag || filter.language !== language) {
    setFilter({ tag, language });
    setOffset(0);
  }

  const offsetAsPage = getOffsetAsPage(offset, DEFAULT_LIMIT);

  const { data, isLoading, isError, error, refetch } = useBlogPosts({
    offset: offset,
    tag,
    limit: DEFAULT_LIMIT,
  });

  const renderedItems = useMemo(
    () =>
      data?.data.map((post) => (
        <BlogPostCard
          key={`list-${post.id}`}
          post={post}
          categoryId={tag}
          blogRoutePrefix="/blog"
        />
      )),
    [data, tag],
  );

  return (
    <DetailsBox
      {...others}
      title={
        tagTitle
          ? t("blog.list.taggedTitle", { tag: tagTitle })
          : t("blog.list.title")
      }
    >
      {tagTitle && (
        <Badge
          component="button"
          type="button"
          aria-label={t("actions.clear")}
          className="cursor-pointer"
          onClick={onTagDeselect}
          rightSection={<IconX size={12} aria-hidden />}
        >
          {tagTitle}
        </Badge>
      )}
      {isLoading && <CenteredLoading />}
      {isError && (
        <>
          <CenteredErrorMessage message={getErrorMessage(error)} />
          <Button onClick={() => refetch()}>{t("blog.read.retry")}</Button>
        </>
      )}
      {!isLoading && data != undefined && data.data.length === 0 && (
        <Center>
          <Text className={"text-status-warning-text"}>
            {t("blog.list.empty")}{" "}
            <Link href="/blog/archive" className="underline" replace>
              {t("actions.goBack")}
            </Link>
            .
          </Text>
        </Center>
      )}

      <Box className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"}>
        {renderedItems}
      </Box>
      <GameViewPagination
        wrapperProps={{
          className: "mt-auto",
        }}
        page={offsetAsPage}
        paginationInfo={data?.pagination}
        onPaginationChange={(page) =>
          setOffset(getPageAsOffset(page, DEFAULT_LIMIT))
        }
      />
    </DetailsBox>
  );
};

export { BlogPostsListView };
