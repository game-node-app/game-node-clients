import { UseCommentsProps } from "#@/components/comment/hooks/useComments";
import { useItemStatistics } from "#@/components/statistics/hooks/useItemStatistics";
import { ActionIcon, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { StatisticsSourceRequestDto } from "@repo/wrapper/server";
import { IconMessageCircle } from "@tabler/icons-react";

interface Props extends Pick<UseCommentsProps, "sourceId" | "sourceType"> {
  onClick: () => void;
}

/**
 * The comment count comes from the source's statistics (`commentsCount`, with
 * replies), the same query the like button already reads, instead of loading
 * a page of comments per card just for its total.
 */
const ItemCommentsButton = ({ onClick, sourceId, sourceType }: Props) => {
  const { t } = useTranslation();
  const statisticsQuery = useItemStatistics(
    sourceId,
    sourceType as string as StatisticsSourceRequestDto.sourceType,
  );
  const totalCommentsCount = statisticsQuery.data?.commentsCount ?? 0;

  return (
    <ActionIcon
      onClick={onClick}
      variant={"subtle"}
      size={"xl"}
      color={"var(--gn-text)"}
      aria-label={t("actions.viewComments")}
      loading={statisticsQuery.isLoading}
    >
      <IconMessageCircle className={"me-0.5"} />
      {totalCommentsCount > 0 && <Text>{totalCommentsCount}</Text>}
    </ActionIcon>
  );
};

export { ItemCommentsButton };
