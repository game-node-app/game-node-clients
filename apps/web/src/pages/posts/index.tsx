import React from "react";
import { PostsFeedView } from "@repo/ui";
import { useRouter } from "next/router";

const PostsPage = () => {
  const router = useRouter();
  const { postId } = router.query;

  return <PostsFeedView targetedPostId={postId as string | undefined} />;
};

export default PostsPage;
