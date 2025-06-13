import React from "react";
import {
  GetPostsRequestDto,
  useInfinitePosts,
} from "#@/components/posts/hooks/useInfinitePosts.ts";
import {
  CenteredErrorMessage,
  CenteredLoading,
  PostsList,
  SimpleInfiniteLoader,
} from "#@/components";
import { Stack } from "@mantine/core";

interface Props extends GetPostsRequestDto {
  withUserProfile?: boolean;
}

const PostsListView = ({ withUserProfile = true, ...request }: Props) => {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    isFetching,
    hasNextPage,
  } = useInfinitePosts(request);

  console.log("PostsListView", data);

  if (isLoading) {
    return <CenteredLoading />;
  }
  if (
    data == undefined ||
    (data.pages.length === 1 && data.pages.at(0)?.data.length === 0)
  ) {
    return <CenteredErrorMessage message={"No posts found."} />;
  }

  const items = data?.pages.flatMap((page) => page.data);

  return (
    <Stack className={"w-full h-full"}>
      {isError && <CenteredErrorMessage error={error} />}
      <PostsList items={items} withUserProfile={withUserProfile} />
      <SimpleInfiniteLoader
        fetchNextPage={async () => {
          await fetchNextPage();
        }}
        isFetching={isFetching}
        hasNextPage={hasNextPage}
      />
    </Stack>
  );
};

export { PostsListView };
