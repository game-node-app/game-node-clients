import React, { PropsWithChildren } from "react";
import { ProfileBanner } from "#@/components/profile/view/ProfileBanner";
import { Box, Group, Stack, Text } from "@mantine/core";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { ProfileUserInfo } from "#@/components/profile/view/ProfileUserInfo";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useDisclosure } from "@mantine/hooks";
import { ProfileEditForm } from "#@/components/profile/edit/ProfileEditForm";
import { useOnMobile } from "#@/components/general/hooks/useOnMobile";
import { Modal } from "#@/util";
import { useOnMobilePlatform } from "#@/components";

interface ProfileUserInfoWithBannerProps extends PropsWithChildren {
  userId: string;
}

/**
 * Wrapper component that renders both ProfileUserInfo and ProfileBanner. <br>
 * Also features edit modals for username and avatar.
 *
 * @constructor
 * @param userId - target user id
 * @param children - items to be rendered on the RIGHT side of the ProfileUserInfo component for desktop,
 * and BELOW it for mobile.
 */

const ProfileUserInfoWithBanner = ({
  userId,
  children,
}: ProfileUserInfoWithBannerProps) => {
  const onMobile = useOnMobile();
  const onMobilePlatform = useOnMobilePlatform();
  const profileQuery = useUserProfile(userId);

  const [editModalOpened, editModalUtils] = useDisclosure();

  return (
    <Stack
      id={"profile-user-info-banner"}
      className={"h-full gap-0 w-dvw max-w-full relative"}
    >
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
        className={"w-full justify-start items-start flex-wrap lg:flex-nowrap"}
      >
        <Stack
          className={
            "w-full lg:w-1/4 lg:min-w-52  gap-0 relative web:bg-[#151515]"
          }
        >
          <Stack className={"w-full items-center relative mobile:items-start "}>
            <Box className={"w-fit h-8 mobile:h-3 mobile:ps-2"}>
              <Box className={"relative w-fit h-fit -translate-y-3/4"}>
                <UserAvatar
                  className={"relative border-[#161616] border-4"}
                  userId={userId}
                  size={onMobilePlatform ? "8rem" : "10rem"}
                />
              </Box>
            </Box>
            <Text
              className={
                "text-center text-white mobile:font-bold mobile:text-xl mobile:ps-6"
              }
            >
              {profileQuery.data?.username}
            </Text>
          </Stack>
          {onMobilePlatform && (
            <Text className={"my-3"}>{profileQuery.data?.bio}</Text>
          )}
          <ProfileUserInfo
            userId={userId}
            onEditClick={editModalUtils.open}
            withEditDetailsButton={!onMobilePlatform}
          />
        </Stack>

        <Stack className={"lg:items-start w-full lg:w-3/4 p-1 lg:p-3"}>
          {children}
        </Stack>
      </Group>
    </Stack>
  );
};

export { ProfileUserInfoWithBanner };
