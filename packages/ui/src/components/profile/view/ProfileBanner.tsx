import {
  PROFILE_BANNER_DESKTOP_ASPECT,
  PROFILE_BANNER_DESKTOP_SIZE,
  PROFILE_BANNER_IMAGE_STYLE,
  PROFILE_BANNER_MOBILE_SIZE,
} from "#@/components/profile/util/profileBannerLayout";
import { ProfileEditBannerUploader } from "#@/components/profile/edit/ProfileEditBannerUploader";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileVideo } from "#@/components/profile/view/ProfileVideo";
import { Modal, cn } from "#@/util";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";
import { ActionIcon, Box, Center, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconCameraPlus } from "@tabler/icons-react";
import type { CSSProperties, PropsWithChildren } from "react";

interface ProfileBannerProps extends PropsWithChildren {
  userId: string;
  showEditButton?: boolean;
  customSource?: string;
  layout?: "cover" | "compact";
}

const ProfileBanner = ({
  userId,
  showEditButton = false,
  customSource,
  layout = "compact",
  children,
}: ProfileBannerProps) => {
  const profile = useUserProfile(userId);

  const banner = profile.data?.banner;
  const bannerVideo = profile.data?.bannerVideo;
  const bannerSrc = banner
    ? getS3StoredUpload(`${banner.filename}.${banner.extension}`)
    : undefined;
  const image = customSource ?? bannerSrc;

  const coverSizes = {
    "--profile-banner-mobile-height": `${PROFILE_BANNER_MOBILE_SIZE.height}px`,
    "--profile-banner-desktop-height": `${PROFILE_BANNER_DESKTOP_SIZE.height}px`,
    "--profile-banner-desktop-aspect": PROFILE_BANNER_DESKTOP_ASPECT,
  } as CSSProperties;

  const [editBannerModalOpen, editBannerModalUtils] = useDisclosure();

  return (
    <Box
      data-testid={"profile-banner"}
      className="relative w-full overflow-hidden rounded-t-lg"
    >
      <Paper
        radius={0}
        style={{
          ...PROFILE_BANNER_IMAGE_STYLE,
          ...(layout === "cover" && coverSizes),
          backgroundImage: image ? `url(${image})` : undefined,
        }}
        className={cn(
          "relative w-full",
          layout === "cover"
            ? "h-[var(--profile-banner-mobile-height)] sm:h-auto sm:max-h-[var(--profile-banner-desktop-height)] sm:aspect-[var(--profile-banner-desktop-aspect)]"
            : "min-h-48",
        )}
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
        {layout === "cover" && (
          <Box
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent via-transparent"
          />
        )}
        {editBannerModalOpen && (
          <Modal
            opened={editBannerModalOpen}
            onClose={editBannerModalUtils.close}
            fullScreen
          >
            <ProfileEditBannerUploader onClose={editBannerModalUtils.close} />
          </Modal>
        )}
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
