import React, { useMemo, useState } from "react";
import {
    useComments,
    UseCommentsProps,
} from "@/components/comment/hooks/useComments";
import {
    Divider,
    Group,
    LoadingOverlay,
    Pagination,
    Paper,
    Stack,
} from "@mantine/core";
import CommentsListItem from "@/components/comment/view/CommentsListItem";
import CenteredErrorMessage from "@/components/general/CenteredErrorMessage";
import CenteredLoading from "@/components/general/CenteredLoading";
import GameViewPagination from "@/components/game/view/GameViewPagination";
import CommentEditorView from "@/components/comment/editor/CommentEditorView";
import { useRenderedComments } from "@/components/comment/hooks/useRenderedComments";

interface Props extends Omit<UseCommentsProps, "limit" | "offset"> {}

const COMMENTS_LIST_VIEW_DEFAULT_LIMIT = 10;

const CommentsListView = ({ ...hookProps }: Props) => {
    const [offset, setOffset] = useState(0);
    const offsetAsPage =
        offset >= COMMENTS_LIST_VIEW_DEFAULT_LIMIT
            ? Math.ceil((offset + 1) / COMMENTS_LIST_VIEW_DEFAULT_LIMIT)
            : 1;
    const commentsQuery = useComments({
        ...hookProps,
        offset,
        limit: COMMENTS_LIST_VIEW_DEFAULT_LIMIT,
    });

    const items = useRenderedComments({
        data: commentsQuery.data?.data || [],
        sourceId: hookProps.sourceId,
        sourceType: hookProps.sourceType,
    });

    const hasNextPage =
        commentsQuery.data != undefined &&
        commentsQuery.data.pagination.hasNextPage;

    const shouldShowPagination =
        commentsQuery.data != undefined && (offsetAsPage !== 1 || hasNextPage);
    return (
        <Stack className={"w-full h-full relative"}>
            {commentsQuery.isError && (
                <CenteredErrorMessage
                    message={"Error while fetching comments. Please try again."}
                />
            )}
            <LoadingOverlay visible={commentsQuery.isLoading} />
            {items}
            {shouldShowPagination && (
                <GameViewPagination
                    page={offsetAsPage}
                    paginationInfo={commentsQuery.data?.pagination}
                    onPaginationChange={(page) => {
                        const pageAsOffset =
                            COMMENTS_LIST_VIEW_DEFAULT_LIMIT * (page - 1);
                        setOffset(pageAsOffset);
                    }}
                />
            )}
        </Stack>
    );
};

export default CommentsListView;
