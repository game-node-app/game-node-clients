import { useTranslation } from "@repo/locales";
import { type PostsFeedTabValue, useInfinitePostsFeed } from "@repo/ui";
import { IconMessages } from "@tabler/icons-react";
import { ListEmptyState } from "@/components/general/card";

interface Props {
  criteria: PostsFeedTabValue;
  targetedPostId?: string;
  limit?: number;
}

/**
 * Shown under the feed when it loaded with no posts. Uses the same query key as `PostsFeed`
 * (criteria, limit, postId), so it reads the already cached result instead of fetching again.
 */
const MobilePostsFeedEmpty = ({
  criteria,
  targetedPostId,
  limit = 20,
}: Props) => {
  const { t } = useTranslation();
  const { data } = useInfinitePostsFeed({
    criteria,
    limit,
    postId: targetedPostId,
  });

  if (!data || data.pages.some((page) => page.data.length > 0)) return null;

  return (
    <ListEmptyState
      className="mx-0"
      icon={<IconMessages size={28} />}
      title={t("posts.empty.title")}
      description={t("posts.empty.description")}
    />
  );
};

export { MobilePostsFeedEmpty };
