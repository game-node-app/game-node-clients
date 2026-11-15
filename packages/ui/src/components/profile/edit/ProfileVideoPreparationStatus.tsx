import { Button, Progress, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";

export interface ProfileVideoPreparationStatusProps {
  /** `0..1`. */
  progress: number;
  onCancel: () => void;
}

/**
 * Shown while the video is being cropped and reduced on the device, before
 * the upload starts.
 */
export function ProfileVideoPreparationStatus({
  progress,
  onCancel,
}: ProfileVideoPreparationStatusProps) {
  const { t } = useTranslation();
  const percent = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  return (
    <Stack
      gap={"xs"}
      className={"w-full"}
      data-testid={"profile-video-preparation"}
    >
      <Text fz={13} lh={"18px"}>
        {t("profileVideo.prepare.progress", { percent })}
      </Text>
      <Progress value={percent} size={"sm"} />
      <Button variant={"default"} size={"xs"} onClick={onCancel}>
        {t("profileVideo.prepare.cancel")}
      </Button>
    </Stack>
  );
}
