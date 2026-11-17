import { PROFILE_BANNER_IMAGE_STYLE } from "#@/components/profile/util/profileBannerLayout";
import { ProfileEditBannerUploader } from "#@/components/profile/edit/ProfileEditBannerUploader";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileVideo } from "#@/components/profile/view/ProfileVideo";
import { Modal } from "#@/util";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";
import { ActionIcon, Box, Center, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCameraPlus } from "@tabler/icons-react";
import { PropsWithChildren } from "react";

interface ProfileBannerProps extends PropsWithChildren {
  userId: string;
  showEditButton?: boolean;
  customSource?: string;
}

const ProfileBanner = ({
  userId,
  showEditButton = false,
  customSource,
  children,
}: ProfileBannerProps) => {
  const profile = useUserProfile(userId);

  const hasBanner =
    profile.data != undefined && profile.data.banner != undefined;

  const banner = profile.data?.banner;
  const bannerVideo = profile.data?.bannerVideo;
  const bannerSrc = hasBanner
    ? getS3StoredUpload(`${banner?.filename}.${banner?.extension}`)
    : undefined;

  const [editBannerModalOpen, editBannerModalUtils] = useDisclosure();

  return (
    <Box
      data-testid={"profile-banner"}
      className={
        "w-full h-full bg-[#161616] p-0 mobile:-ms-4 mobile:min-w-[100vw]"
      }
    >
      <Paper
        radius={0}
        style={{
          ...PROFILE_BANNER_IMAGE_STYLE,
          backgroundImage: `url(${customSource ? customSource : bannerSrc})`,
        }}
        className={"w-full min-h-48 relative"}
      >
        {/* A locally selected image replaces the banner, so the published
            video must not play over the preview. */}
        {!customSource && bannerVideo && (
          <ProfileVideo
            video={bannerVideo}
            poster={bannerSrc}
            className={"absolute inset-0"}
          />
        )}
        <Modal
          opened={editBannerModalOpen}
          onClose={editBannerModalUtils.close}
          fullScreen
        >
          <ProfileEditBannerUploader onClose={editBannerModalUtils.close} />
        </Modal>
        {showEditButton && (
          <Center
            className={
              "absolute left-1/2 right-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 bottom-1/2"
            }
          >
            <ActionIcon
              size={"xl"}
              radius="xl"
              variant={"default"}
              onClick={editBannerModalUtils.open}
              className={""}
            >
              <IconCameraPlus />
            </ActionIcon>
          </Center>
        )}
      </Paper>
      {children}
    </Box>
  );
};

export { ProfileBanner };
