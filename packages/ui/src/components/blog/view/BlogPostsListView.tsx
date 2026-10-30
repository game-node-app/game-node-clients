import React, { useEffect, useMemo, useState } from "react";
import {
  BlogPostsListItem,
  CenteredErrorMessage,
  CenteredLoading,
  DetailsBox,
  DetailsBoxProps,
  GameViewPagination,
  TextLink,
  useBlogPosts,
} from "#@/components";
import { Badge, Button, Center, Chip, Text } from "@mantine/core";
import {
  getCapitalizedText,
  getErrorMessage,
  getOffsetAsPage,
  getPageAsOffset,
} from "#@/util";
import { useTranslation, useI18nContext } from "@repo/locales";

interface Props extends Omit<DetailsBoxProps, "title"> {
  tag: string | undefined;
  onTagDeselect: () => void;
}

const DEFAULT_LIMIT = 20;

const BlogPostsListView = ({ tag, onTagDeselect, ...others }: Props) => {
  const { t } = useTranslation();
  const [offset, setOffset] = useState(0);
  const { language } = useI18nContext();
  useEffect(() => setOffset(0), [tag, language]);

  const offsetAsPage = getOffsetAsPage(offset, DEFAULT_LIMIT);

  const { data, isLoading, isError, error, refetch } = useBlogPosts({
    offset: offset,
    tag,
    limit: DEFAULT_LIMIT,
  });

  const renderedItems = useMemo(
    () =>
      data?.data.map((post) => (
        <BlogPostsListItem key={`list-${post.id}`} post={post} />
      )),
    [data],
  );

  return (
    <DetailsBox
      {...others}
      title={tag ? t("blog.list.taggedTitle", { tag }) : t("blog.list.title")}
    >
      {tag && <Badge onClick={onTagDeselect}>{getCapitalizedText(tag)}</Badge>}
      {isLoading && <CenteredLoading />}
      {isError && (
        <>
          <CenteredErrorMessage message={getErrorMessage(error)} />
          <Button onClick={() => refetch()}>{t("blog.read.retry")}</Button>
        </>
      )}
      {!isLoading && data != undefined && data.data.length === 0 && (
        <Center>
          <Text className={"text-yellow-400"}>
            {t("blog.list.empty")}{" "}
            <TextLink href={"/blog/archive"}>{t("actions.goBack")}</TextLink>.
          </Text>
        </Center>
      )}

      {renderedItems}
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
