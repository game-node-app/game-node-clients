import useUserId from "@/components/auth/hooks/useUserId";
import CollectionView from "@/components/collection/view/CollectionView";
import { DetailsBox } from "@/components/general/DetailsBox";
import LibraryViewFab from "@/components/library/view/fab/LibraryViewFab";
import LibraryView from "@/components/library/view/LibraryView";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonRouter,
} from "@ionic/react";
import { Container } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import RecentCollectionEntriesView from "@/components/collection/collection-entry/view/RecentCollectionEntriesView";

interface Props {
    userId?: string;
}

const LibraryPage = ({ userId }: Props) => {
    const ownUserId = useUserId();
    const userIdToUse = userId == undefined && ownUserId != undefined ? ownUserId : userId;
    const isOwnLibrary = userIdToUse === ownUserId;

    const {
        routeInfo: { pathname },
    } = useIonRouter();

    const params = useSearchParameters();

    const isInTab = pathname.split("/").length === 2;

    const profileQuery = useUserProfile(userIdToUse);

    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

    useEffect(() => {
        const paramsCollectionId = params.get("collectionId");
        setSelectedCollectionId(paramsCollectionId);
    }, [params]);

    return (
        <IonPage>
            <SessionAuth requireAuth={userId == undefined}>
                {isInTab && isOwnLibrary ? null : (
                    <IonHeader>
                        <IonToolbar>
                            <IonButtons slot={"start"}>
                                <IonBackButton />
                            </IonButtons>
                            {isOwnLibrary ? (
                                <IonTitle>Your library</IonTitle>
                            ) : (
                                <IonTitle>{`${profileQuery.data?.username}`}&apos;s library</IonTitle>
                            )}
                        </IonToolbar>
                    </IonHeader>
                )}

                <IonContent>
                    {isOwnLibrary && <LibraryViewFab selectedCollectionId={selectedCollectionId} />}
                    <Container fluid className="my-4">
                        <LibraryView
                            userId={userIdToUse}
                            collectionId={selectedCollectionId}
                            onChange={setSelectedCollectionId}
                        >
                            {selectedCollectionId ? (
                                <CollectionView libraryUserId={userIdToUse!} collectionId={selectedCollectionId} />
                            ) : (
                                <DetailsBox
                                    title={
                                        isOwnLibrary
                                            ? "Your recent games"
                                            : `${profileQuery.data?.username}'s recent games`
                                    }
                                    stackProps={{ className: "w-full" }}
                                >
                                    <RecentCollectionEntriesView userId={userIdToUse!} limit={12} />
                                </DetailsBox>
                            )}
                        </LibraryView>
                    </Container>
                </IonContent>
            </SessionAuth>
        </IonPage>
    );
};

export default LibraryPage;
