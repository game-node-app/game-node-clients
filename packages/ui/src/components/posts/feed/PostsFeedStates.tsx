import { ListEmptyState } from "#@/components/general/ListEmptyState";
import { Button, Skeleton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconMessages, IconPlus } from "@tabler/icons-react";

/** Placeholder with the shape of a post: header, game chip, body lines, actions. */
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

/** Shown while the first page of the feed loads. */
const PostsFeedSkeleton = () => (
  <div className="flex flex-col gap-4" role="status" aria-busy>
    <PostSkeleton />
    <PostSkeleton />
  </div>
);

interface PostsFeedEmptyProps {
  /** Same action as the "Create" button above the feed: reveals the post editor. */
  onCreate?: () => void;
}

/** Shown under the editor when the feed loaded with no posts. */
const PostsFeedEmpty = ({ onCreate }: PostsFeedEmptyProps) => {
  const { t } = useTranslation();

  return (
    <ListEmptyState
      icon={<IconMessages size={28} />}
      title={t("posts.empty.title")}
      description={t("posts.empty.description")}
      action={
        onCreate && (
          <Button
            radius="xl"
            leftSection={<IconPlus size={18} />}
            onClick={onCreate}
          >
            {t("posts.empty.create")}
          </Button>
        )
      }
    />
  );
};

export { PostsFeedSkeleton, PostsFeedEmpty };
export type { PostsFeedEmptyProps };
