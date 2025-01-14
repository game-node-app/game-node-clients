import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import React from "react";
import CenteredLoading from "@/components/general/CenteredLoading";
import { Container } from "@mantine/core";
import ProfileReviewListView from "@/components/profile/view/ProfileReviewListView";

interface Props {
    userId: string;
}

const ProfileReviewListPage = ({ userId }: Props) => {
    const profileQuery = useUserProfile(userId);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot={"start"}>
                        <IonBackButton />
                    </IonButtons>
                    {profileQuery.data && <IonTitle>{profileQuery.data.username}&apos;s reviews</IonTitle>}
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {profileQuery.isLoading && <CenteredLoading />}
                <Container fluid className={"my-4"}>
                    <ProfileReviewListView userId={userId} />
                </Container>
            </IonContent>
        </IonPage>
    );
};

export default ProfileReviewListPage;
