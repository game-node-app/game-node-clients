import React, { useMemo } from "react";
import {
  useComments,
  UseCommentsProps,
} from "#@/components/comment/hooks/useComments";
import { IconMessages } from "@tabler/icons-react";
import { ActionIcon, Text } from "@mantine/core";

interface Props extends Omit<UseCommentsProps, "enabled"> {
  onClick: () => void;
}

const ItemCommentsButton = ({ onClick, ...hookProps }: Props) => {
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

  const hasComments = totalCommentsCount > 0;

  return (
    <ActionIcon
      onClick={onClick}
      variant={"subtle"}
      size={"xl"}
      color={hasComments ? "brand.4" : "white"}
      loading={commentsQuery.isLoading}
    >
      <IconMessages className={"me-0.5"} />
      {totalCommentsCount > 0 && <Text>{totalCommentsCount}</Text>}
    </ActionIcon>
  );
};

export { ItemCommentsButton };
