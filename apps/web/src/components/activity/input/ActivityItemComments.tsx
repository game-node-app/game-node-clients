import React from "react";
import ItemCommentsButton from "@/components/comment/input/ItemCommentsButton";
import { Activity, FindAllCommentsDto } from "@/wrapper/server";
import sourceType = FindAllCommentsDto.sourceType;
import { useDisclosure } from "@mantine/hooks";
import { Modal, Stack } from "@mantine/core";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import CommentsListView from "@/components/comment/view/CommentsListView";
import CommentEditorView from "@/components/comment/editor/CommentEditorView";

interface Props {
    activity: Activity;
}

const ActivityItemComments = ({ activity }: Props) => {
    const onMobile = useOnMobile();
    const [commentsModalOpened, commentsModalUtils] = useDisclosure();

    return (
        <>
            <Modal
                title={"Comments in this activity"}
                opened={commentsModalOpened}
                onClose={commentsModalUtils.close}
                size={"xl"}
                fullScreen={onMobile}
            >
                <Stack className={`w-full h-full`}>
                    <CommentsListView
                        enabled={commentsModalOpened}
                        sourceId={activity.id}
                        sourceType={sourceType.ACTIVITY}
                    />
                    <CommentEditorView
                        sourceType={sourceType.ACTIVITY}
                        sourceId={activity.id}
                    />
                </Stack>
            </Modal>
            <ItemCommentsButton
                sourceType={sourceType.ACTIVITY}
                sourceId={activity.id}
                onClick={commentsModalUtils.open}
            />
        </>
    );
};

export default ActivityItemComments;
