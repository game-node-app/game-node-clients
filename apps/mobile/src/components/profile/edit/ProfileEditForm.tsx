import React from "react";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import { ActionIcon, Box, Center, Container, Flex, Group, Stack, Text } from "@mantine/core";
import ProfileBanner from "@/components/profile/view/ProfileBanner";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import { IconCameraPlus, IconEdit } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import ProfileEditAvatarUploader from "@/components/profile/edit/ProfileEditAvatarUploader";
import ProfileEditUsernameUpdate from "@/components/profile/edit/ProfileEditUsernameUpdate";
import ProfileEditFeaturedAchievement from "@/components/profile/edit/ProfileEditFeaturedAchievement";
import { DetailsBox } from "@/components/general/DetailsBox";
import ProfileEditBioForm from "@/components/profile/edit/ProfileEditBioForm";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from "@ionic/react";

interface Props {
    userId: string;
}

const ProfileEditForm = ({ userId }: Props) => {
    const profileQuery = useUserProfile(userId);

    const [editAvatarModalOpened, editAvatarModalUtils] = useDisclosure();
    const [editUsernameModalOpen, editUsernameModalUtils] = useDisclosure();

    return (
        <Stack className={"w-full h-full "}>
            <IonModal isOpen={editAvatarModalOpened} onDidDismiss={editAvatarModalUtils.close}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Update your avatar</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={editAvatarModalUtils.close}>Cancel</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Container fluid className="my-4">
                        <ProfileEditAvatarUploader onClose={editAvatarModalUtils.close} />
                    </Container>
                </IonContent>
            </IonModal>
            <IonModal
                isOpen={editUsernameModalOpen}
                onDidDismiss={editUsernameModalUtils.close}
                initialBreakpoint={0.75}
                breakpoints={[0.5, 0.75]}
            >
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Update username</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={editUsernameModalUtils.close}>Cancel</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <Container fluid className="my-4">
                        <ProfileEditUsernameUpdate onClose={editUsernameModalUtils.close} />
                    </Container>
                </IonContent>
            </IonModal>

            <Stack className={"w-full gap-0 items-center"}>
                <ProfileBanner userId={userId} showEditButton={true} />
                <Stack className={"w-full items-center relative -top-20"}>
                    <Box className={"relative w-fit h-fit"}>
                        <UserAvatar
                            className={"relative border-[#161616] border-[7px]"}
                            userId={userId}
                            size={"10rem"}
                        />
                        <Center
                            className={
                                "absolute left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 bottom-1/2 z-20"
                            }
                        >
                            <ActionIcon
                                size={"lg"}
                                radius={"xl"}
                                variant="default"
                                className={"z-20"}
                                onClick={editAvatarModalUtils.open}
                            >
                                <IconCameraPlus />
                            </ActionIcon>
                        </Center>
                    </Box>

                    <Group className={"items-center"}>
                        <Text className={""}>{profileQuery.data?.username}</Text>
                        <ActionIcon size={"md"} variant="default" onClick={editUsernameModalUtils.open}>
                            <IconEdit />
                        </ActionIcon>
                    </Group>
                </Stack>
            </Stack>
            <Stack className={"w-full relative -top-20"}>
                <DetailsBox title={"Bio"}>
                    <ProfileEditBioForm />
                </DetailsBox>
                <DetailsBox title={"Featured achievement"} description={"Click to edit"}>
                    <Flex className={"w-full justify-center"}>
                        <ProfileEditFeaturedAchievement />
                    </Flex>
                </DetailsBox>
            </Stack>
        </Stack>
    );
};

export default ProfileEditForm;
