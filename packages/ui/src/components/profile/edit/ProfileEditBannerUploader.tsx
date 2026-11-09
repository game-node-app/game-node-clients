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
  PROFILE_BANNER_IMAGE_ACCEPT,
  PROFILE_VIDEO_ACCEPT,
  PROFILE_VIDEO_MAX_SIZE,
} from "#@/components/profile/util/profileUploadAccept";
import { isProfileVideoFile } from "#@/components/profile/util/profileVideoFile";
import { useSupporterStatus } from "#@/components/supporter/hooks/useSupporterStatus";
import { ProfileBanner } from "#@/components/profile/view/ProfileBanner";
import { createErrorNotification } from "#@/util";
import { base64ToBlob, getCroppedImg } from "#@/util/imageUtils";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import { Button, Group, Slider, Stack, Stepper, Text } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "@repo/locales";
import { ProfileService, UpdateProfileImageDto } from "@repo/wrapper/server";
import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import type { Accept } from "react-dropzone";
import type = UpdateProfileImageDto.type;

/** Same limit the banner dropzone used before the video flow. */
const BANNER_IMAGE_MAX_SIZE = 3 * 1024 ** 2;
/** Output aspect of the server-rendered banner video. */
const BANNER_VIDEO_ASPECT = 1280 / 548;
const BANNER_SUPPORTER_ACCEPT: Accept = {
  ...PROFILE_BANNER_IMAGE_ACCEPT,
  ...PROFILE_VIDEO_ACCEPT,
};

type SelectedFileKind = "image" | "video";
type VideoPreviewState = "probing" | "previewable" | "unpreviewable";

const ProfileEditBannerUploader = ({ onClose }: BaseModalChildrenProps) => {
  const { t } = useTranslation();
  const userId = useUserId();
  const profileQuery = useUserProfile(userId);
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
  const [uploadedFileSrc, setUploadedFileSrc] = useState<string>();
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
      uploadedFileSrc!,
      croppedAreaPixels,
    );
    setFinalImageSrc(croppedImage ?? undefined);
  };

  const resetSelection = () => {
    setSelectedFile(undefined);
    setUploadedFileSrc(undefined);
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

  const profileBannerMutation = useMutation({
    mutationFn: async () => {
      if (!finalImageSrc) {
        throw new Error(t("upload.messages.invalidImageSource"));
      }

      await ProfileService.profileControllerUpdateImageV1({
        file: await base64ToBlob(finalImageSrc),
        type: type.BANNER,
      });
    },
    onError: createErrorNotification,
    onSuccess: () => {
      profileQuery.invalidate();
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
        type: "banner",
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

  const handleUpload = () => {
    if (selectedFileKind === "video") {
      performVideoUpload();
      return;
    }
    if (finalImageSrc == undefined) {
      handleStepClick(0);
      return;
    }
    profileBannerMutation.mutate();
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
    if (!isVideo && file.size > BANNER_IMAGE_MAX_SIZE) {
      setSelectionError(
        t("profileVideo.upload.messages.imageTooLarge", {
          size: (BANNER_IMAGE_MAX_SIZE / 1024 ** 2).toFixed(0),
        }),
      );
      return;
    }

    setSelectedFile(file);
    setUploadedFileSrc(URL.createObjectURL(file));
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
                  ? BANNER_SUPPORTER_ACCEPT
                  : PROFILE_BANNER_IMAGE_ACCEPT
              }
              maxSize={
                isSupporter ? PROFILE_VIDEO_MAX_SIZE : BANNER_IMAGE_MAX_SIZE
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
          if (videoPreviewState === "previewable" && uploadedFileSrc) {
            return (
              <ProfileVideoCropStep
                src={uploadedFileSrc}
                aspect={BANNER_VIDEO_ASPECT}
                cropShape={"rect"}
                showGrid={true}
                onCropComplete={handleVideoCropComplete}
                onBack={() => handleStepClick(0)}
                onConfirm={() => handleStepClick(2)}
              />
            );
          }

          return (
            <Stack className={"items-center"}>
              {uploadedFileSrc && (
                <ProfileVideoProbe
                  src={uploadedFileSrc}
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
              image={uploadedFileSrc}
              crop={crop}
              zoom={zoom}
              aspect={21 / 9}
              cropShape="rect"
              showGrid={true}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
            <Slider
              mt={350}
              min={0.1}
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
                description={t("profileVideo.labels.bannerVideoHelp")}
                withBorder
              >
                <Stack className={"items-center"}>
                  {uploadedFileSrc && (
                    <ProfileVideoPreview
                      src={uploadedFileSrc}
                      aspect={BANNER_VIDEO_ASPECT}
                      className={"rounded-[10px]"}
                    />
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
                  onClick={() => handleUpload()}
                  loading={videoUpload.isPending}
                >
                  {t("actions.confirm")}
                </Button>
              </Group>
            </>
          );
        }

        if (!finalImageSrc || !userId) {
          return <CenteredLoading />;
        }
        return (
          <>
            <DetailsBox
              title={t("recap.labels.preview")}
              description={t("profile.labels.previewBanner")}
              withBorder
            >
              <ProfileBanner userId={userId} customSource={finalImageSrc} />
            </DetailsBox>
            <Group justify={"center"} mb={10}>
              <Button variant={"default"} onClick={() => handleStepClick(1)}>
                {t("actions.goBack")}
              </Button>
              <Button
                onClick={() => handleUpload()}
                loading={profileBannerMutation.isPending}
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
      {profileBannerMutation.isError && (
        <Text c={"red"}>{profileBannerMutation.error.message}</Text>
      )}
      <Stack className={"w-full h-full relative"}>{renderBasedOnStep()}</Stack>
    </Stack>
  );
};

export { ProfileEditBannerUploader };
