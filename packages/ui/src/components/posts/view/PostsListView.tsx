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
import { getErrorMessage } from "#@/util";

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

  if (isLoading) {
    return <CenteredLoading />;
  }
  if (data == undefined) {
    return null;
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
