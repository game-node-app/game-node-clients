import React from "react";
import ItemCommentsButton from "@/components/comment/input/ItemCommentsButton";
import { Activity, FindAllCommentsDto } from "@/wrapper/server";
import { useDisclosure } from "@mantine/hooks";
import { Container, Stack } from "@mantine/core";
import CommentsListView from "@/components/comment/view/CommentsListView";
import CommentEditorView from "@/components/comment/editor/CommentEditorView";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonToolbar } from "@ionic/react";
import sourceType = FindAllCommentsDto.sourceType;

interface Props {
    activity: Activity;
}

const ActivityItemComments = ({ activity }: Props) => {
    const [commentsModalOpened, commentsModalUtils] = useDisclosure();

    return (
        <>
            <IonModal isOpen={commentsModalOpened} onDidDismiss={commentsModalUtils.close}>
                <IonHeader>
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot="end">
                                <IonButton onClick={commentsModalUtils.close}>Close</IonButton>
                            </IonButtons>
                        </IonToolbar>
                    </IonHeader>
                </IonHeader>
                <IonContent>
                    <Container fluid className={"my-4"}>
                        <Stack className={`w-full h-full`}>
                            <CommentsListView
                                enabled={commentsModalOpened}
                                sourceId={activity.id}
                                sourceType={sourceType.ACTIVITY}
                            />
                            <CommentEditorView sourceType={sourceType.ACTIVITY} sourceId={activity.id} />
                        </Stack>
                    </Container>
                </IonContent>
            </IonModal>
            <ItemCommentsButton
                sourceType={sourceType.ACTIVITY}
                sourceId={activity.id}
                onClick={commentsModalUtils.open}
            />
        </>
    );
};

export default ActivityItemComments;
