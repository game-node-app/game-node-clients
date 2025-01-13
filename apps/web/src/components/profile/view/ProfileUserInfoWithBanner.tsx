import React, { PropsWithChildren } from "react";
import ProfileBanner from "@/components/profile/view/ProfileBanner";
import {
    ActionIcon,
    AspectRatio,
    Box,
    Button,
    Divider,
    Group,
    Modal,
    Overlay,
    Stack,
    Text,
} from "@mantine/core";
import { UserAvatar } from "@/components/general/avatar/UserAvatar";
import ProfileUserInfo from "@/components/profile/view/ProfileUserInfo";
import ProfileViewNavbar from "@/components/profile/view/ProfileViewNavbar";
import ProfileFavoriteGames from "@/components/profile/view/ProfileFavoriteGames";
import RecentActivityList from "@/components/activity/RecentActivityList";
import useUserProfile from "@/components/profile/hooks/useUserProfile";
import useUserId from "@/components/auth/hooks/useUserId";
import { IconEdit } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import ProfileEditForm from "@/components/profile/edit/ProfileEditForm";
import useOnMobile from "@/components/general/hooks/useOnMobile";
import UserRecentGames from "@/components/playtime/UserRecentGames";

interface ProfileUserInfoWithBannerProps extends PropsWithChildren {
    userId: string;
}

/**
 * Wrapper component that renders both ProfileUserInfo and ProfileBanner. <br>
 * Also features edit modals for username and avatar.
 *
 * @constructor
 * @param userId - target user id
 * @param showEditButtons - if edit buttons should be shown
 * @param customSources
 * @param children - items to be rendered on the RIGHT side of the ProfileUserInfo component for desktop,
 * and BELOW it for mobile.
 */

const ProfileUserInfoWithBanner = ({
    userId,
    children,
}: ProfileUserInfoWithBannerProps) => {
    const onMobile = useOnMobile();
    const ownUserId = useUserId();
    const profileQuery = useUserProfile(userId);

    const [editModalOpened, editModalUtils] = useDisclosure();

    return (
        <Stack className={"w-full h-full gap-0"}>
            <Modal
                opened={editModalOpened}
                onClose={editModalUtils.close}
                title={"Edit profile"}
                fullScreen={onMobile}
            >
                <ProfileEditForm userId={userId} />
            </Modal>
            <ProfileBanner userId={userId} />

            <Group
                className={
                    "w-full justify-start items-start flex-wrap lg:flex-nowrap"
                }
            >
                <Stack
                    className={
                        "w-full lg:w-1/4 lg:min-w-52 bg-[#161616] gap-0 relative"
                    }
                >
                    <Stack className={"w-full items-center relative -top-20"}>
                        <Box className={"relative w-fit h-fit"}>
                            <UserAvatar
                                className={
                                    "relative border-[#161616] border-[7px]"
                                }
                                userId={userId}
                                size={"10rem"}
                            />
                        </Box>

                        <Text className={"text-center"}>
                            {profileQuery.data?.username}
                        </Text>
                    </Stack>

                    <Stack className={"w-full h-full relative -top-14"}>
                        <ProfileUserInfo
                            userId={userId}
                            onEditClick={editModalUtils.open}
                        />
                    </Stack>
                </Stack>

                <Stack
                    className={
                        "lg:items-start w-full lg:w-3/4 p-1 lg:p-3 lg:mt-4"
                    }
                >
                    {children}
                </Stack>
            </Group>
        </Stack>
    );
};

export default ProfileUserInfoWithBanner;
