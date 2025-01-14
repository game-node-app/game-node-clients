import React from "react";
import { BaseModalProps } from "@/util/types/modal-props";
import { Button, Center, Container, Group, Modal, Stack, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollectionsEntriesService } from "@/wrapper/server";
import useUserId from "@/components/auth/hooks/useUserId";
import { useOwnCollectionEntryForGameId } from "@/components/collection/collection-entry/hooks/useOwnCollectionEntryForGameId";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";

interface ICollectionEntryRemoveModalProps extends BaseModalProps {
    gameId: number;
}

const CollectionEntryRemoveModal = ({ gameId, onClose, opened }: ICollectionEntryRemoveModalProps) => {
    const queryClient = useQueryClient();
    const collectionEntriesQuery = useOwnCollectionEntryForGameId(gameId);
    const collectionEntryRemoveMutation = useMutation({
        mutationFn: (entryId: string) => {
            return CollectionsEntriesService.collectionsEntriesControllerDeleteOwnEntryV1(entryId);
        },
        onSuccess: () => {
            collectionEntriesQuery.invalidate();
            queryClient.invalidateQueries({ queryKey: ["review", gameId] });
            onClose();
        },
    });

    return (
        <IonModal isOpen={opened} onDidDismiss={onClose} initialBreakpoint={0.5} breakpoints={[0, 0.25, 0.5, 0.75]}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Remove from your library</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => onClose()}>Cancel</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <SessionAuth>
                    <Container fluid className={"min-h-screen my-4"}>
                        <Stack justify={"center"} w={"100%"} ta={"center"}>
                            <Text fz={"lg"}>
                                You are about to <strong>remove</strong> this game and any related data{" "}
                                <strong>(including reviews!)</strong> from your library.
                            </Text>
                            <Text c={"dimmed"} fz={"sm"}>
                                If you wish to <strong>move</strong> this game between collections, you can use the
                                Update option instead.
                            </Text>
                            <Text>Are you sure?</Text>
                            <Group wrap={"nowrap"} justify={"center"}>
                                <Button onClick={onClose} color={"blue"}>
                                    Go back
                                </Button>
                                <Button
                                    onClick={() => {
                                        collectionEntryRemoveMutation.mutate(collectionEntriesQuery.data!.id);
                                    }}
                                    color={"red"}
                                >
                                    Confirm
                                </Button>
                            </Group>
                        </Stack>
                    </Container>
                </SessionAuth>
            </IonContent>
        </IonModal>
    );
};

export default CollectionEntryRemoveModal;
