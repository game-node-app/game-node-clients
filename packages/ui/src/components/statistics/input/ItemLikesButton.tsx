import { useUserId } from "#@/components/auth/hooks/useUserId";
import {
  IToggleLikeProps,
  useUserLike,
} from "#@/components/statistics/hooks/useUserLike";
import { ActionIcon, ActionIconProps, Text } from "@mantine/core";
import { IconThumbUp, IconThumbUpFilled } from "@tabler/icons-react";
import { useRedirectToAuth } from "#@/components/auth/hooks/useRedirectToAuth";
import { useTranslation } from "@repo/locales";

interface Props extends IToggleLikeProps, ActionIconProps {}

const ItemLikesButton = ({
  sourceType,
  sourceId,
  initialStatistics,
  ...others
}: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const redirectToAuth = useRedirectToAuth();
  const [likesCount, isLiked, toggleUserLike] = useUserLike({
    sourceId: sourceId,
    sourceType: sourceType,
    initialStatistics,
  });

  return (
    <ActionIcon
      onClick={async () => {
        if (!userId) {
          void redirectToAuth();
          return;
        }
        toggleUserLike();
      }}
      variant={"subtle"}
      size={"xl"}
      color={isLiked ? "brand.4" : "var(--gn-text)"}
      aria-label={t("actions.like")}
      aria-pressed={isLiked}
      data-disabled={!userId}
      {...others}
    >
      {isLiked ? <IconThumbUpFilled /> : <IconThumbUp />}
      {likesCount > 0 && <Text>{likesCount}</Text>}
    </ActionIcon>
  );
};

export { ItemLikesButton };
