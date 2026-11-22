import { Box, Image, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconCamera } from "@tabler/icons-react";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { ProfileEditAvatarUploader } from "#@/components/profile/edit/ProfileEditAvatarUploader";
import { ProfileEditBannerUploader } from "#@/components/profile/edit/ProfileEditBannerUploader";
import { ProfileVideoUploadStatus } from "#@/components/profile/edit/ProfileVideoUploadStatus";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileVideo } from "#@/components/profile/view/ProfileVideo";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsSection } from "#@/components/settings/common/SettingsSection";
import { useSupporterStatus } from "#@/components/supporter/hooks/useSupporterStatus";
import { getS3StoredUpload, Modal } from "#@/util";

interface Props {
  userId: string;
}

/**
 * Banner and avatar. Each image is uploaded right away by its own uploader
 * (crop + confirm), so it doesn't take part in "Save changes".
 */
export function SettingsProfileImages({ userId }: Props) {
  const { t } = useTranslation();
  const profileQuery = useUserProfile(userId);
  /*
   * Warm this before the uploader modal mounts: the uploader waits for the
   * status before rendering its dropzone, so it should not wait on every open.
   */
  useSupporterStatus();
  const [bannerModalOpened, bannerModal] = useDisclosure();
  const [avatarModalOpened, avatarModal] = useDisclosure();

  const banner = profileQuery.data?.banner;
  const bannerVideo = profileQuery.data?.bannerVideo;
  const bannerSrc = banner
    ? getS3StoredUpload(`${banner.filename}.${banner.extension}`)
    : undefined;

  return (
    <SettingsSection
      sectionId="images"
      title={t("settings.profile.images.title")}
      description={t("settings.profile.images.description")}
    >
      <Modal
        opened={bannerModalOpened}
        onClose={bannerModal.close}
        size={"xl"}
        title={t("settings.profile.images.changeBanner")}
      >
        <ProfileEditBannerUploader onClose={bannerModal.close} />
      </Modal>
      <Modal
        opened={avatarModalOpened}
        onClose={avatarModal.close}
        size={"xl"}
        title={t("settings.profile.images.changeAvatar")}
      >
        <ProfileEditAvatarUploader onClose={avatarModal.close} />
      </Modal>
      <SettingsCard withDividers={false}>
        {/* Cover + overlapping avatar: each image is a tap target of its own. */}
        <Box className={"relative"}>
          <Box
            component={"button"}
            type={"button"}
            onClick={bannerModal.open}
            aria-label={t("settings.profile.images.changeBanner")}
            className={
              "group relative block h-[140px] w-full cursor-pointer overflow-hidden border-0 bg-nav-raised p-0"
            }
          >
            {bannerSrc && (
              <Image
                src={bannerSrc}
                alt={""}
                className={"absolute inset-0 h-full w-full object-cover"}
              />
            )}
            {bannerVideo && (
              <ProfileVideo
                video={bannerVideo}
                poster={bannerSrc}
                className={"absolute inset-0"}
              />
            )}
            <span
              className={
                "absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-media-content-scrim px-3 py-1.5 text-[12px] font-medium text-media group-hover:bg-media-scrim-strong"
              }
            >
              <IconCamera size={14} />
              {t("settings.profile.images.changeBanner")}
            </span>
          </Box>
          <Box
            component={"button"}
            type={"button"}
            onClick={avatarModal.open}
            aria-label={t("settings.profile.images.changeAvatar")}
            className={
              "absolute -bottom-9 left-4 cursor-pointer rounded-full border-4 border-solid border-secondary bg-secondary p-0"
            }
          >
            <UserAvatar userId={userId} size={80} className={"shrink-0"} />
            <span
              className={
                "absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-solid border-secondary bg-accent text-accent-contrast"
              }
            >
              <IconCamera size={14} />
            </span>
          </Box>
        </Box>
        <Stack gap={8} className={"px-4 pb-4 pt-12"}>
          <Text fz={13} lh={"18px"} className={"text-dimmed-2"}>
            {t("settings.profile.images.bannerHelp")}
          </Text>
          <ProfileVideoUploadStatus slot={"banner"} />
          <ProfileVideoUploadStatus slot={"avatar"} />
        </Stack>
      </SettingsCard>
    </SettingsSection>
  );
}
