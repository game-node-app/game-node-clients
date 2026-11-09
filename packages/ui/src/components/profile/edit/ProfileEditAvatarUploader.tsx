import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { ImageDropzone } from "#@/components/general/ImageDropzone";
import { ProfileVideoCropStep } from "#@/components/profile/edit/ProfileVideoCropStep";
import { ProfileVideoPreview } from "#@/components/profile/edit/ProfileVideoPreview";
import { ProfileVideoProbe } from "#@/components/profile/edit/ProfileVideoProbe";
import { ProfileVideoSupporterNotice } from "#@/components/profile/edit/ProfileVideoSupporterNotice";
import { useProfileVideoUpload } from "#@/components/profile/hooks/useProfileVideoUpload";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import type { VideoCropArea } from "#@/components/profile/util/normalizeVideoCrop";
import { normalizeVideoCrop } from "#@/components/profile/util/normalizeVideoCrop";
import {
  PROFILE_AVATAR_IMAGE_ACCEPT,
  PROFILE_VIDEO_ACCEPT,
  PROFILE_VIDEO_MAX_SIZE,
} from "#@/components/profile/util/profileUploadAccept";
import { isProfileVideoFile } from "#@/components/profile/util/profileVideoFile";
import { useSupporterStatus } from "#@/components/supporter/hooks/useSupporterStatus";
import { createErrorNotification } from "#@/util";
import { base64ToBlob, getCroppedImg } from "#@/util/imageUtils";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import {
  Avatar,
  Box,
  Button,
  Group,
  Slider,
  Stack,
  Stepper,
  Text,
} from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { ProfileService, UpdateProfileImageDto } from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import type { Accept } from "react-dropzone";
import type = UpdateProfileImageDto.type;

type Props = BaseModalChildrenProps;

/** Same limit the avatar dropzone used before the video flow. */
const AVATAR_IMAGE_MAX_SIZE = 10 * 1024 * 1000;
const AVATAR_SUPPORTER_ACCEPT: Accept = {
  ...PROFILE_AVATAR_IMAGE_ACCEPT,
  ...PROFILE_VIDEO_ACCEPT,
};

type SelectedFileKind = "image" | "video";
type VideoPreviewState = "probing" | "previewable" | "unpreviewable";

const ProfileEditAvatarUploader = ({ onClose }: Props) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const profile = useUserProfile(userId);
  const supporterStatus = useSupporterStatus();
  const isSupporter = supporterStatus.data?.isSupporter === true;
  const isSupporterStatusKnown = supporterStatus.data != undefined;
  /*
   * A native file dialog freezes the dropzone's `accept` list when it opens, so
   * the dropzone must not render with the image-only list while the status is
   * still in flight. A failed status read falls through to image-only, as before.
   */
  const isSupporterStatusPending =
    supporterStatus.data == undefined &&
    (supporterStatus.isLoading || supporterStatus.isPending);
  const videoUpload = useProfileVideoUpload();

  const [selectedFile, setSelectedFile] = useState<File>();
  const [selectedFileSrc, setSelectedFileSrc] = useState<string>();
  const [selectedFileKind, setSelectedFileKind] = useState<SelectedFileKind>();
  const [videoPreviewState, setVideoPreviewState] =
    useState<VideoPreviewState>("probing");
  const [videoCropPercentages, setVideoCropPercentages] =
    useState<VideoCropArea>();
  const [finalImageSrc, setFinalImageSrc] = useState<string>();
  const [selectionError, setSelectionError] = useState<string>();

  /*
   * Cropper properties
   */
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  /*
   * Stepper
   */
  const [currentStep, setCurrentStep] = useState<number>(0);

  const onCropComplete = async (_: Area, croppedAreaPixels: Area) => {
    const croppedImage = await getCroppedImg(
      selectedFileSrc!,
      croppedAreaPixels,
    );
    setFinalImageSrc(croppedImage ?? undefined);
  };

  const resetSelection = () => {
    setSelectedFile(undefined);
    setSelectedFileSrc(undefined);
    setSelectedFileKind(undefined);
    setVideoPreviewState("probing");
    setVideoCropPercentages(undefined);
    setFinalImageSrc(undefined);
    setSelectionError(undefined);
  };

  const handleStepClick = (step: number) => {
    const isOutOfBonds = step < 0 || step > 2;
    if (isOutOfBonds) return;
    // A video that cannot be previewed has no crop step.
    if (
      step === 1 &&
      selectedFileKind === "video" &&
      videoPreviewState !== "previewable"
    ) {
      return;
    }
    if (step === 0) {
      resetSelection();
    } else if (step === 1) {
      setFinalImageSrc(undefined);
      setVideoCropPercentages(undefined);
    }

    setCurrentStep(step);
  };

  const profileAvatarMutation = useMutation({
    mutationFn: async () => {
      if (!finalImageSrc) {
        throw new Error(t("upload.messages.invalidImageSource"));
      }

      await ProfileService.profileControllerUpdateImageV1({
        file: await base64ToBlob(finalImageSrc!),
        type: type.AVATAR,
      });
    },
    onError: createErrorNotification,
    onSuccess: () => {
      profile.invalidate();
      if (onClose) onClose();
    },
  });

  const handleVideoProbeResult = (previewable: boolean) => {
    if (previewable) {
      setVideoPreviewState("previewable");
      return;
    }

    setVideoPreviewState("unpreviewable");
    setCurrentStep(2);
  };

  const handleVideoCropComplete = (percentages: VideoCropArea) => {
    setVideoCropPercentages(percentages);
  };

  const performVideoUpload = () => {
    if (!selectedFile) {
      setSelectionError(t("profileVideo.upload.messages.invalidVideoSource"));
      return;
    }

    const crop =
      videoPreviewState === "previewable" && videoCropPercentages
        ? normalizeVideoCrop(videoCropPercentages)
        : undefined;

    videoUpload.mutate(
      {
        file: selectedFile,
        type: "avatar",
        crop,
      },
      {
        onSuccess: ({ messageKey }) => {
          notifications.show({
            color: "teal",
            message: t(messageKey),
          });
          if (onClose) onClose();
        },
        onError: (error) => {
          notifications.show({
            color: "red",
            message: t(error.messageKey),
          });
        },
      },
    );
  };

  const performUpload = () => {
    if (selectedFileKind === "video") {
      performVideoUpload();
      return;
    }
    if (finalImageSrc == undefined) {
      handleStepClick(0);
      return;
    }
    profileAvatarMutation.mutate();
  };

  const onReceivedFile = (file: FileWithPath) => {
    setSelectionError(undefined);

    const isVideo = isProfileVideoFile(file);
    const isGif =
      file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");

    if (isGif) {
      setSelectionError(t("profileVideo.upload.messages.gifNotSupported"));
      return;
    }
    if (isVideo && !isSupporter) {
      setSelectionError(t("profileVideo.upload.messages.forbidden"));
      return;
    }
    if (isVideo && file.size > PROFILE_VIDEO_MAX_SIZE) {
      setSelectionError(
        t("upload.messages.rejectedTooLarge", {
          size: (PROFILE_VIDEO_MAX_SIZE / 1024 ** 2).toFixed(0),
        }),
      );
      return;
    }
    if (!isVideo && file.size > AVATAR_IMAGE_MAX_SIZE) {
      setSelectionError(
        t("profileVideo.upload.messages.imageTooLarge", {
          size: (AVATAR_IMAGE_MAX_SIZE / 1024 ** 2).toFixed(2),
        }),
      );
      return;
    }

    setSelectedFile(file);
    setSelectedFileSrc(URL.createObjectURL(file));
    setSelectedFileKind(isVideo ? "video" : "image");
    setFinalImageSrc(undefined);
    setVideoCropPercentages(undefined);
    if (isVideo) setVideoPreviewState("probing");
    setCurrentStep(1);
  };

  const renderBasedOnStep = () => {
    switch (currentStep) {
      case 0:
        if (isSupporterStatusPending) {
          return <CenteredLoading />;
        }

        return (
          <Stack gap={"sm"}>
            <ImageDropzone
              maxFiles={1}
              accept={
                isSupporter
                  ? AVATAR_SUPPORTER_ACCEPT
                  : PROFILE_AVATAR_IMAGE_ACCEPT
              }
              maxSize={
                isSupporter ? PROFILE_VIDEO_MAX_SIZE : AVATAR_IMAGE_MAX_SIZE
              }
              onDrop={(files) => {
                if (files.length > 0) {
                  onReceivedFile(files[0]);
                }
              }}
            />
            {selectionError && (
              <Text c={"red"} data-testid={"profile-upload-error"}>
                {selectionError}
              </Text>
            )}
            {isSupporterStatusKnown && !isSupporter && (
              <ProfileVideoSupporterNotice />
            )}
          </Stack>
        );
      case 1:
        if (selectedFileKind === "video") {
          if (videoPreviewState === "previewable" && selectedFileSrc) {
            return (
              <ProfileVideoCropStep
                src={selectedFileSrc}
                aspect={1}
                cropShape={"round"}
                showGrid={false}
                onCropComplete={handleVideoCropComplete}
                onBack={() => handleStepClick(0)}
                onConfirm={() => handleStepClick(2)}
              />
            );
          }

          return (
            <Stack className={"items-center"}>
              {selectedFileSrc && (
                <ProfileVideoProbe
                  src={selectedFileSrc}
                  onResult={handleVideoProbeResult}
                />
              )}
              <CenteredLoading />
              <Button variant={"default"} onClick={() => handleStepClick(0)}>
                {t("actions.goBack")}
              </Button>
            </Stack>
          );
        }

        return (
          <>
            <Cropper
              image={selectedFileSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
            <Slider
              mt={350}
              min={1}
              step={0.1}
              max={2}
              value={zoom}
              onChange={setZoom}
            />
            <Group justify={"center"} mb={10}>
              <Button variant={"default"} onClick={() => handleStepClick(0)}>
                {t("actions.goBack")}
              </Button>
              <Button onClick={() => handleStepClick(2)}>
                {t("actions.confirm")}
              </Button>
            </Group>
          </>
        );
      case 2:
        if (selectedFileKind === "video") {
          return (
            <>
              <DetailsBox
                title={t("recap.labels.preview")}
                description={t("profileVideo.labels.avatarVideoHelp")}
                withBorder
              >
                <Stack className={"items-center"}>
                  {selectedFileSrc && (
                    <Box className={"h-64 w-64 overflow-hidden rounded-full"}>
                      <ProfileVideoPreview
                        src={selectedFileSrc}
                        aspect={1}
                        className={"h-full"}
                      />
                    </Box>
                  )}
                  {videoPreviewState === "unpreviewable" && (
                    <Text
                      fz={13}
                      lh={"18px"}
                      className={"text-[#adadad]"}
                      data-testid={"profile-video-center-crop-notice"}
                    >
                      {t("profileVideo.crop.centerCropNotice")}
                    </Text>
                  )}
                </Stack>
              </DetailsBox>
              <Group justify={"center"} mb={10}>
                <Button
                  variant={"default"}
                  onClick={() =>
                    handleStepClick(videoPreviewState === "previewable" ? 1 : 0)
                  }
                >
                  {t("actions.goBack")}
                </Button>
                <Button
                  onClick={() => performUpload()}
                  loading={videoUpload.isPending}
                >
                  {t("actions.confirm")}
                </Button>
              </Group>
            </>
          );
        }

        return (
          <>
            <DetailsBox
              title={t("recap.labels.preview")}
              description={t("profile.labels.previewAvatar")}
              withBorder
            >
              <Stack className={"items-center"}>
                <Avatar src={finalImageSrc} size={"20rem"} />
              </Stack>
            </DetailsBox>
            <Group justify={"center"} mb={10}>
              <Button variant={"default"} onClick={() => handleStepClick(1)}>
                {t("actions.goBack")}
              </Button>
              <Button
                onClick={() => performUpload()}
                loading={profileAvatarMutation.isPending}
              >
                {t("actions.confirm")}
              </Button>
            </Group>
          </>
        );
    }
  };

  return (
    <Stack className={"w-full"}>
      <Stepper
        active={currentStep}
        onStepClick={handleStepClick}
        allowNextStepsSelect={false}
        size={"sm"}
      >
        <Stepper.Step />
        <Stepper.Step />
        <Stepper.Step />
      </Stepper>
      {profileAvatarMutation.isError && (
        <Text c={"red"}>{profileAvatarMutation.error.message}</Text>
      )}
      <Stack className={"w-full h-full relative"}>{renderBasedOnStep()}</Stack>
    </Stack>
  );
};

export { ProfileEditAvatarUploader };
