import React, { useMemo, useState } from "react";
import { UserComment } from "@/components/comment/types";
import { useRenderedComments } from "@/components/comment/hooks/useRenderedComments";
import { CreateCommentDto } from "@/wrapper/server";
import { Pagination, Stack } from "@mantine/core";
import GameViewPagination from "@/components/game/view/GameViewPagination";
import { getCommentSourceId } from "@/components/comment/util/getCommentSourceId";
import { getCommentSourceType } from "@/components/comment/util/getCommentSourceType";

const DEFAULT_LIMIT = 10;

interface Props {
    // The source, top-level comment
    comment: UserComment;
}

/**
 * Used to render the inner comments of any kind of comment (e.g. review or activity comment)
 * @constructor
 */
const CommentsThreadListView = ({ comment }: Props) => {
    // Children are automatically pre-fetched for each comment, so no need to show
    // a loading state
    const children = comment.parentOf;

    const [offset, setOffset] = useState(0);

    const offsetAsPage =
        offset >= DEFAULT_LIMIT ? Math.ceil((offset + 1) / DEFAULT_LIMIT) : 1;

    const sourceId = useMemo(() => {
        return getCommentSourceId(comment);
    }, [comment]);

    const sourceType = useMemo(() => {
        return getCommentSourceType(comment);
    }, [comment]);

    const items = useRenderedComments({
        data: children || [],
        sourceId: sourceId,
        sourceType: sourceType,
    });

    const slicedItems = useMemo(() => {
        return items.slice(offset, offset + DEFAULT_LIMIT);
    }, [items, offset]);

    const shouldShowPagination =
        items != undefined && items.length > DEFAULT_LIMIT;

    return (
        <Stack className={"w-full h-full relative"}>
            {slicedItems}
            {shouldShowPagination && (
                <Pagination
                    total={items.length}
                    value={offsetAsPage}
                    onChange={(page) => {
                        const pageAsOffset = DEFAULT_LIMIT * (page - 1);
                        setOffset(pageAsOffset);
                    }}
                />
            )}
        </Stack>
    );
};

export default CommentsThreadListView;
