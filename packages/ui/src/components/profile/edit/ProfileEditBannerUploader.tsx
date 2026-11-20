import { useUserId } from "#@/components/auth/hooks/useUserId";
import { CenteredLoading } from "#@/components/general/CenteredLoading";
import { DetailsBox } from "#@/components/general/DetailsBox";
import { ImageDropzone } from "#@/components/general/ImageDropzone";
import { ProfileVideoCropStep } from "#@/components/profile/edit/ProfileVideoCropStep";
import { ProfileVideoPreview } from "#@/components/profile/edit/ProfileVideoPreview";
import { ProfileVideoProbe } from "#@/components/profile/edit/ProfileVideoProbe";
import { ProfileVideoSupporterNotice } from "#@/components/profile/edit/ProfileVideoSupporterNotice";
import { ProfileVideoPreparationStatus } from "#@/components/profile/edit/ProfileVideoPreparationStatus";
import { useProfileVideoPreparation } from "#@/components/profile/hooks/useProfileVideoPreparation";
import { useProfileVideoUpload } from "#@/components/profile/hooks/useProfileVideoUpload";
import { useUserProfile } from "#@/components/profile/hooks/useUserProfile";
import type { VideoCropArea } from "#@/components/profile/util/normalizeVideoCrop";
import { normalizeVideoCrop } from "#@/components/profile/util/normalizeVideoCrop";
import {
  PROFILE_BANNER_IMAGE_ACCEPT,
  PROFILE_VIDEO_ACCEPT,
  PROFILE_VIDEO_MAX_SIZE,
} from "#@/components/profile/util/profileUploadAccept";
import { PROFILE_BANNER_DESKTOP_ASPECT } from "#@/components/profile/util/profileBannerLayout";
import { isProfileVideoFile } from "#@/components/profile/util/profileVideoFile";
import { useSupporterStatus } from "#@/components/supporter/hooks/useSupporterStatus";
import { ProfileBannerPreview } from "#@/components/profile/edit/ProfileBannerPreview";
import { createErrorNotification } from "#@/util";
import { base64ToBlob, getCroppedImg } from "#@/util/imageUtils";
import { BaseModalChildrenProps } from "#@/util/types/modal-props";
import {
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
import React, { useEffect, useRef, useState } from "react";
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
  const videoPreparation = useProfileVideoPreparation();

  const [selectedFile, setSelectedFile] = useState<File>();
  const [uploadedFileSrc, setUploadedFileSrc] = useState<string>();
  const [selectedFileKind, setSelectedFileKind] = useState<SelectedFileKind>();
  const [videoPreviewState, setVideoPreviewState] =
    useState<VideoPreviewState>("probing");
  const [videoCropPercentages, setVideoCropPercentages] =
    useState<VideoCropArea>();
  const [finalImageSrc, setFinalImageSrc] = useState<string>();
  const [isCropReady, setIsCropReady] = useState(false);
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

  const cropRevision = useRef(0);
  const pendingCrop = useRef<{ timer?: ReturnType<typeof setTimeout> }>({});
  const [mediaHeight, setMediaHeight] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);
  const maxPan = Math.max(0, mediaHeight * zoom - cropHeight);
  const verticalPosition = maxPan ? 50 - (crop.y / maxPan) * 100 : 50;

  useEffect(() => {
    const pending = pendingCrop.current;
    return () => {
      clearTimeout(pending.timer);
      if (uploadedFileSrc) URL.revokeObjectURL(uploadedFileSrc);
    };
  }, [uploadedFileSrc]);

  const changeCrop = (next: { x: number; y: number }) => {
    if (next.x === crop.x && next.y === crop.y) return;
    cropRevision.current++;
    setIsCropReady(false);
    setCrop(next);
  };

  const changeZoom = (value: number) => {
    if (value === zoom) return;
    cropRevision.current++;
    setIsCropReady(false);
    setZoom(value);
  };

  const onCropComplete = async (_: Area, croppedAreaPixels: Area) => {
    clearTimeout(pendingCrop.current.timer);
    const revision = ++cropRevision.current;
    try {
      const croppedImage = await getCroppedImg(
        uploadedFileSrc!,
        croppedAreaPixels,
      );
      if (revision === cropRevision.current) {
        setFinalImageSrc(croppedImage ?? undefined);
        setIsCropReady(croppedImage != null);
      }
    } catch (error) {
      if (revision === cropRevision.current)
        createErrorNotification(
          error instanceof Error ? error : new Error(String(error)),
        );
    }
  };

  const resetSelection = () => {
    cropRevision.current++;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
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
    if (step === 2 && selectedFileKind === "image" && !isCropReady) return;
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

  const performVideoUpload = async () => {
    if (!selectedFile) {
      setSelectionError(t("profileVideo.upload.messages.invalidVideoSource"));
      return;
    }

    const cropPercentages =
      videoPreviewState === "previewable" ? videoCropPercentages : undefined;
    let fileToSend: File = selectedFile;
    let crop = cropPercentages
      ? normalizeVideoCrop(cropPercentages)
      : undefined;

    // Crop and shrink on the device first; the server still converts it.
    const preparation = await videoPreparation.prepare({
      file: selectedFile,
      slot: "banner",
      cropPercentages,
    });
    if (preparation.status === "cancelled") return;
    if (preparation.status === "prepared") {
      fileToSend = preparation.file;
      // Already framed, so the server must not crop it again.
      crop = undefined;
    }

    videoUpload.mutate(
      {
        file: fileToSend,
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

    cropRevision.current++;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setIsCropReady(false);
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
          <Stack gap="md">
            <Stack gap={4}>
              <Text fw={600}>{t("profile.bannerEditor.title")}</Text>
              <Text size="sm" c="dimmed">
                {t("profile.bannerEditor.help")}
              </Text>
            </Stack>
            <Box
              pos="relative"
              h={280}
              style={{ overflow: "hidden", borderRadius: 10 }}
            >
              <Cropper
                image={uploadedFileSrc}
                crop={crop}
                zoom={zoom}
                aspect={PROFILE_BANNER_DESKTOP_ASPECT}
                cropShape="rect"
                showGrid
                minZoom={1}
                maxZoom={3}
                onMediaLoaded={(media) => setMediaHeight(media.height)}
                onCropSizeChange={(size) => setCropHeight(size.height)}
                onCropChange={changeCrop}
                onCropComplete={onCropComplete}
                onCropAreaChange={(area, pixels) => {
                  clearTimeout(pendingCrop.current.timer);
                  pendingCrop.current.timer = setTimeout(() => {
                    void onCropComplete(area, pixels);
                  }, 150);
                }}
                onZoomChange={changeZoom}
              />
            </Box>
            <Text size="sm">{t("profile.bannerEditor.verticalPosition")}</Text>
            <Slider
              min={0}
              max={100}
              step={1}
              value={verticalPosition}
              disabled={!maxPan}
              onChange={(position) =>
                changeCrop({ ...crop, y: (0.5 - position / 100) * maxPan })
              }
              aria-label={t("profile.bannerEditor.verticalPosition")}
            />
            <Text size="sm">{t("profileVideo.crop.zoom")}</Text>
            <Slider
              min={1}
              step={0.1}
              max={3}
              value={zoom}
              onChange={changeZoom}
              aria-label={t("profileVideo.crop.zoom")}
            />
            {finalImageSrc && userId && (
              <ProfileBannerPreview userId={userId} src={finalImageSrc} />
            )}
            <Group justify="center" mb={10}>
              <Button variant="default" onClick={() => handleStepClick(0)}>
                {t("actions.goBack")}
              </Button>
              <Button
                disabled={!finalImageSrc || !isCropReady}
                onClick={() => handleStepClick(2)}
              >
                {t("actions.confirm")}
              </Button>
            </Group>
          </Stack>
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
                      className={"text-dimmed-2"}
                      data-testid={"profile-video-center-crop-notice"}
                    >
                      {t("profileVideo.crop.centerCropNotice")}
                    </Text>
                  )}
                </Stack>
              </DetailsBox>
              {videoPreparation.isPreparing && (
                <ProfileVideoPreparationStatus
                  progress={videoPreparation.progress}
                  onCancel={videoPreparation.cancel}
                />
              )}
              <Group justify={"center"} mb={10}>
                <Button
                  variant={"default"}
                  disabled={videoPreparation.isPreparing}
                  onClick={() =>
                    handleStepClick(videoPreviewState === "previewable" ? 1 : 0)
                  }
                >
                  {t("actions.goBack")}
                </Button>
                <Button
                  onClick={() => handleUpload()}
                  loading={videoUpload.isPending}
                  disabled={videoPreparation.isPreparing}
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
              <ProfileBannerPreview userId={userId} src={finalImageSrc} />
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
