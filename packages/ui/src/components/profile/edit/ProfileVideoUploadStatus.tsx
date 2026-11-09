import { useProfileVideoUploads } from "#@/components/profile/hooks/useProfileVideoUploads";
import type { ProfileVideoSlotType } from "#@/components/profile/hooks/useProfileVideoUpload";
import { useTranslation } from "@repo/locales";
import { ProfileVideoUploadResponseDto } from "@repo/wrapper/server";
import { Group, Loader, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

/**
 * Server error codes mapped to their locale keys. One table so a new code
 * cannot be handled in one surface and forgotten in another.
 */
const ERROR_MESSAGE_KEYS = {
  [ProfileVideoUploadResponseDto.errorCode.CONVERSION_FAILED]:
    "profileVideo.status.errors.conversion_failed",
  [ProfileVideoUploadResponseDto.errorCode.OUTPUT_TOO_LARGE]:
    "profileVideo.status.errors.output_too_large",
  [ProfileVideoUploadResponseDto.errorCode.UPLOAD_FAILED]:
    "profileVideo.status.errors.upload_failed",
  [ProfileVideoUploadResponseDto.errorCode.SOURCE_MISSING]:
    "profileVideo.status.errors.source_missing",
  [ProfileVideoUploadResponseDto.errorCode.TIMEOUT]:
    "profileVideo.status.errors.timeout",
} as const;

const UNKNOWN_ERROR_MESSAGE_KEY = "profileVideo.status.errors.unknown";

const getErrorMessageKey = (
  errorCode: ProfileVideoUploadResponseDto.errorCode | null,
) => {
  if (errorCode == null) return UNKNOWN_ERROR_MESSAGE_KEY;

  return (
    ERROR_MESSAGE_KEYS[errorCode as keyof typeof ERROR_MESSAGE_KEYS] ??
    UNKNOWN_ERROR_MESSAGE_KEY
  );
};

interface Props {
  slot: ProfileVideoSlotType;
  className?: string;
}

/**
 * Processing, ready or failed state of a slot's latest video upload, shown to
 * the owner next to the avatar or banner it belongs to.
 *
 * The status comes from the owner-only `useProfileVideoUploads` query, which
 * also polls while a slot is processing. A slot with no attempt renders
 * nothing, as does any other viewer (the endpoint is owner-only).
 */
export function ProfileVideoUploadStatus({ slot, className }: Props) {
  const { t } = useTranslation();
  const uploadsQuery = useProfileVideoUploads();
  const upload = uploadsQuery.data?.videoUploads?.[slot];

  if (!upload) return null;

  const testId = `profile-video-status-${slot}`;

  if (upload.status === ProfileVideoUploadResponseDto.status.PROCESSING) {
    return (
      <Group
        gap={6}
        wrap={"nowrap"}
        align={"center"}
        role={"status"}
        data-testid={testId}
        className={className}
      >
        <Loader size={12} />
        <Text fz={12} lh={"16px"} className={"text-[#adadad]"}>
          {t("profileVideo.status.processing")}
        </Text>
      </Group>
    );
  }

  if (upload.status === ProfileVideoUploadResponseDto.status.READY) {
    return (
      <Group
        gap={6}
        wrap={"nowrap"}
        align={"center"}
        role={"status"}
        data-testid={testId}
        className={className}
      >
        <IconCheck size={12} className={"text-teal-400"} />
        <Text fz={12} lh={"16px"} className={"text-[#adadad]"}>
          {t("profileVideo.status.ready")}
        </Text>
      </Group>
    );
  }

  return (
    <Text
      fz={12}
      lh={"16px"}
      c={"red.4"}
      role={"alert"}
      data-testid={testId}
      className={className}
    >
      {t(getErrorMessageKey(upload.errorCode))}
    </Text>
  );
}
