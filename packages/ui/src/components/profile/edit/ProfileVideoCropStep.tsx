import type { VideoCropArea } from "#@/components/profile/util/normalizeVideoCrop";
import { Box, Button, Group, Slider, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useState } from "react";
import Cropper, { Area } from "react-easy-crop";

/** The frame must stay inside the video, so zooming out is never allowed. */
const MIN_ZOOM = 1;
const MAX_ZOOM = 2;

export interface ProfileVideoCropStepProps {
  src: string;
  aspect: number;
  /** Round for avatars, rect for banners. */
  cropShape?: "rect" | "round";
  showGrid?: boolean;
  /**
   * Receives the first `onCropComplete` argument (percentages, `0..100`). The
   * uploader converts it with `normalizeVideoCrop` before submitting.
   */
  onCropComplete: (percentageCrop: VideoCropArea) => void;
  onBack: () => void;
  onConfirm: () => void;
  confirmLoading?: boolean;
}

/**
 * Shared video framing step for the avatar and banner uploaders. It owns the
 * cropper/zoom state so both flows report the same percentage crop.
 */
export function ProfileVideoCropStep({
  src,
  aspect,
  cropShape = "rect",
  showGrid = true,
  onCropComplete,
  onBack,
  onConfirm,
  confirmLoading,
}: ProfileVideoCropStepProps) {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);

  return (
    <Stack gap={"sm"} className={"w-full"}>
      <Stack gap={2}>
        <Text fw={600}>{t("profileVideo.crop.title")}</Text>
        <Text fz={13} lh={"18px"} className={"text-[#adadad]"}>
          {t("profileVideo.crop.help")}
        </Text>
      </Stack>
      <Box
        className={
          "relative h-[320px] w-full overflow-hidden rounded-[10px] bg-black"
        }
      >
        <Cropper
          video={src}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={showGrid}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          onCropChange={setCrop}
          onCropComplete={(percentages: Area) => onCropComplete(percentages)}
          onZoomChange={setZoom}
        />
      </Box>
      <Stack gap={4}>
        <Text fz={12} lh={"16px"} className={"text-[#adadad]"}>
          {t("profileVideo.crop.zoom")}
        </Text>
        <Slider
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.1}
          value={zoom}
          onChange={setZoom}
          aria-label={t("profileVideo.crop.zoom")}
        />
      </Stack>
      <Group justify={"center"} mb={10}>
        <Button variant={"default"} onClick={onBack}>
          {t("actions.goBack")}
        </Button>
        <Button onClick={onConfirm} loading={confirmLoading}>
          {t("actions.confirm")}
        </Button>
      </Group>
    </Stack>
  );
}
