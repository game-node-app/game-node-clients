import { Box, Group, Image, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconCamera } from "@tabler/icons-react";
import { UserAvatar } from "#@/components/general/avatar/UserAvatar";
import { ProfileEditAvatarUploader } from "#@/components/profile/edit/ProfileEditAvatarUploader";
import { ProfileEditBannerUploader } from "#@/components/profile/edit/ProfileEditBannerUploader";
import { ProfileVideoUploadStatus } from "#@/components/profile/edit/ProfileVideoUploadStatus";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import { ProfileVideo } from "#@/components/profile/view/ProfileVideo";
import { SettingsButton } from "#@/components/settings/common/SettingsButton";
import { SettingsCard } from "#@/components/settings/common/SettingsCard";
import { SettingsComingSoonBadge } from "#@/components/settings/common/SettingsPill";
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
      <SettingsCard>
        <Stack gap={12} className={"p-5"}>
          <Box
            className={
              "relative h-[132px] w-full overflow-hidden rounded-[10px] bg-[#222]"
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
            <Box className={"absolute bottom-3 right-3"}>
              <SettingsButton
                variant={"secondary"}
                leftSection={<IconCamera size={14} />}
                onClick={bannerModal.open}
              >
                {t("settings.profile.images.changeBanner")}
              </SettingsButton>
            </Box>
          </Box>
          <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
            {t("settings.profile.images.bannerHelp")}
          </Text>
          <ProfileVideoUploadStatus slot={"banner"} />
        </Stack>
        <Group gap={16} wrap={"nowrap"} className={"p-5"}>
          <UserAvatar userId={userId} size={72} className={"shrink-0"} />
          <Stack gap={8} className={"min-w-0 flex-1"}>
            <Text fz={14} fw={600} c={"white"} lh={"normal"}>
              {t("settings.profile.images.avatarTitle")}
            </Text>
            <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
              {t("settings.profile.images.avatarDescription")}
            </Text>
            <ProfileVideoUploadStatus slot={"avatar"} />
            <Group gap={8}>
              <SettingsButton
                variant={"secondary"}
                leftSection={<IconCamera size={14} />}
                onClick={avatarModal.open}
              >
                {t("settings.profile.images.changeAvatar")}
              </SettingsButton>
              {/* There is no endpoint to delete the avatar yet. */}
              <SettingsButton variant={"ghost"} disabled>
                {t("settings.profile.images.removeAvatar")}
              </SettingsButton>
              <SettingsComingSoonBadge />
            </Group>
          </Stack>
        </Group>
      </SettingsCard>
    </SettingsSection>
  );
}
