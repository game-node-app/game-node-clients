import { useTranslation } from "@repo/locales";
import { type PostsFeedTabValue, useInfinitePostsFeed } from "@repo/ui";
import { IonButton } from "@ionic/react";
import { IconMessages, IconPlus } from "@tabler/icons-react";
import { ListEmptyState } from "@/components/general/card";

interface Props {
  criteria: PostsFeedTabValue;
  targetedPostId?: string;
  limit?: number;
  /** Same action as the "Create" button above the feed: reveals the post editor. */
  onCreate?: () => void;
}

/**
 * Shown under the feed when it loaded with no posts. Uses the same query key as `PostsFeed`
 * (criteria, limit, postId), so it reads the already cached result instead of fetching again.
 */
const MobilePostsFeedEmpty = ({
  criteria,
  targetedPostId,
  limit = 20,
  onCreate,
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
      action={
        onCreate && (
          <IonButton shape="round" onClick={onCreate}>
            <IconPlus slot="start" size={18} />
            {t("posts.empty.create")}
          </IonButton>
        )
      }
    />
  );
};

export { MobilePostsFeedEmpty };
