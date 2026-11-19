import { Skeleton } from "@mantine/core";
import { type PostsFeedTabValue, useInfinitePostsFeed } from "@repo/ui";

interface Props {
  criteria: PostsFeedTabValue;
  targetedPostId?: string;
  limit?: number;
}

/** Placeholder with the shape of `MobilePostsListItem`: header, game chip, body lines, actions. */
const PostSkeleton = () => (
  <div
    aria-hidden
    className="flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-line bg-paper-8 p-4"
  >
    <div className="flex items-center gap-2">
      <Skeleton circle height={32} width={32} />
      <Skeleton height={14} width="35%" radius="xl" />
    </div>
    <Skeleton height={28} width="45%" radius="xl" />
    <div className="flex flex-col gap-2">
      <Skeleton height={12} radius="xl" />
      <Skeleton height={12} radius="xl" />
      <Skeleton height={12} width="70%" radius="xl" />
    </div>
    <div className="flex justify-end gap-2 border-0 border-t border-solid border-line pt-3">
      <Skeleton height={28} width={56} radius="xl" />
      <Skeleton height={28} width={56} radius="xl" />
    </div>
  </div>
);

/**
 * Shown under the "Create" button while the first page of the feed loads. Uses the same query key
 * as `PostsFeed`, so it only reads the shared cache entry.
 */
const MobilePostsFeedSkeleton = ({
  criteria,
  targetedPostId,
  limit = 20,
}: Props) => {
  const { isPending } = useInfinitePostsFeed({
    criteria,
    limit,
    postId: targetedPostId,
  });

  if (!isPending) return null;

  return (
    <div className="flex flex-col gap-4" role="status" aria-busy>
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
};

export { MobilePostsFeedSkeleton };
