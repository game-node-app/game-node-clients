import React, { PropsWithChildren } from "react";
import { Flex, Paper, Stack } from "@mantine/core";
import {
  BlogPostReviewInfo,
  BlogPostTagBadges,
  DetailsBox,
  RecentBlogPostsList,
  useBlogPost,
} from "#@/components";

interface Props extends PropsWithChildren {
  postId: string;
}

const BlogPostDetailLayout = ({ children, postId }: Props) => {
  const post = useBlogPost(postId);

  return (
    <Stack className={"w-full"}>
      <Flex
        className={
          "flex-col gap-4 lg:flex-row lg:flex-nowrap lg:items-start py-4"
        }
      >
        {children}
        <Stack className={"lg:w-4/12 lg:gap-5 h-full"}>
          {post.data?.review && (
            <Paper className={"p-2"}>
              <DetailsBox title={"Reviewed Game"}>
                <BlogPostReviewInfo reviewInfo={post.data.review} />
              </DetailsBox>
            </Paper>
          )}
          <Paper className={"p-2"}>
            <DetailsBox title={"Recent posts"}>
              <RecentBlogPostsList />
            </DetailsBox>
          </Paper>
          <Paper className={"p-2"}>
            <DetailsBox title={"Tags"}>
              <BlogPostTagBadges />
            </DetailsBox>
          </Paper>
        </Stack>
      </Flex>
    </Stack>
  );
};

export { BlogPostDetailLayout };
