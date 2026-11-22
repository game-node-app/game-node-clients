import {
  useComments,
  UseCommentsProps,
} from "#@/components/comment/hooks/useComments";
import { ActionIcon, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconMessageCircle } from "@tabler/icons-react";
import { useMemo } from "react";

interface Props extends Omit<UseCommentsProps, "enabled"> {
  onClick: () => void;
}

const ItemCommentsButton = ({ onClick, ...hookProps }: Props) => {
  const { t } = useTranslation();
  const commentsQuery = useComments({
    orderBy: {
      createdAt: "DESC",
    },
    enabled: true,
    ...hookProps,
  });

  const totalCommentsCount = useMemo(() => {
    if (
      commentsQuery.data == undefined ||
      commentsQuery.data.pagination == undefined
    ) {
      return 0;
    }

    return commentsQuery.data.pagination.totalItems;
  }, [commentsQuery.data]);

  return (
    <ActionIcon
      onClick={onClick}
      variant={"subtle"}
      size={"xl"}
      color={"var(--gn-text)"}
      aria-label={t("actions.viewComments")}
      loading={commentsQuery.isLoading}
    >
      <IconMessageCircle className={"me-0.5"} />
      {totalCommentsCount > 0 && <Text>{totalCommentsCount}</Text>}
    </ActionIcon>
  );
};

export { ItemCommentsButton };
