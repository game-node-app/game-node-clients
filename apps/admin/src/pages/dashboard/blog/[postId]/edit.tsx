import React from "react";
import { useBlogPost } from "@repo/ui";
import { useRouter } from "next/router";

const BlogPostEditPage = () => {
  const router = useRouter();
  const { postId } = router.query;
  const editingPostQuery = useBlogPost(postId as string);

  console.log(editingPostQuery.data);
  return <div></div>;
};

export default BlogPostEditPage;
