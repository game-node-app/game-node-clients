import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, ProfileService } from "@repo/wrapper/server";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { SUPPORTER_QUERY_KEYS } from "#@/components/supporter/hooks/supporterQueryKeys";
import type { NormalizedVideoCrop } from "#@/components/profile/util/normalizeVideoCrop";

export const PROFILE_VIDEO_UPLOAD_MESSAGES = {
  accepted: "profileVideo.upload.messages.accepted",
  alreadyProcessing: "profileVideo.upload.messages.alreadyProcessing",
  invalidFile: "profileVideo.upload.messages.invalidFile",
  forbidden: "profileVideo.upload.messages.forbidden",
  tooLarge: "profileVideo.upload.messages.tooLarge",
  throttled: "profileVideo.upload.messages.throttled",
  failed: "profileVideo.upload.messages.failed",
} as const;

export type ProfileVideoUploadMessageKey =
  (typeof PROFILE_VIDEO_UPLOAD_MESSAGES)[keyof typeof PROFILE_VIDEO_UPLOAD_MESSAGES];

export type ProfileVideoSlotType = "avatar" | "banner";

export type ProfileVideoUploadVariables = {
  file: Blob;
  type: ProfileVideoSlotType;
  /** Omitted when the device could not preview the video; the server centers it. */
  crop?: NormalizedVideoCrop;
};

export type ProfileVideoUploadResult = {
  /** True when the server answered 409: the slot is already being processed. */
  alreadyProcessing: boolean;
  messageKey: ProfileVideoUploadMessageKey;
};

/**
 * Localized failure for a rejected upload. `status` is the HTTP status when the
 * server answered, `null` for network or unexpected errors.
 */
export class ProfileVideoUploadError extends Error {
  public readonly status: number | null;
  public readonly messageKey: ProfileVideoUploadMessageKey;

  constructor(
    messageKey: ProfileVideoUploadMessageKey,
    status: number | null = null,
    message?: string,
  ) {
    super(message ?? messageKey);
    this.name = "ProfileVideoUploadError";
    this.messageKey = messageKey;
    this.status = status;
  }
}

const MESSAGE_KEY_BY_STATUS: Record<number, ProfileVideoUploadMessageKey> = {
  400: PROFILE_VIDEO_UPLOAD_MESSAGES.invalidFile,
  403: PROFILE_VIDEO_UPLOAD_MESSAGES.forbidden,
  413: PROFILE_VIDEO_UPLOAD_MESSAGES.tooLarge,
  429: PROFILE_VIDEO_UPLOAD_MESSAGES.throttled,
};

const toUploadError = (error: unknown): ProfileVideoUploadError => {
  if (error instanceof ApiError) {
    return new ProfileVideoUploadError(
      MESSAGE_KEY_BY_STATUS[error.status] ??
        PROFILE_VIDEO_UPLOAD_MESSAGES.failed,
      error.status,
      error.message,
    );
  }

  return new ProfileVideoUploadError(
    PROFILE_VIDEO_UPLOAD_MESSAGES.failed,
    null,
    error instanceof Error ? error.message : undefined,
  );
};

/**
 * Shared upload mutation for the avatar and banner video flows.
 *
 * A 202 is a success that starts processing; a 409 is also treated as tracking
 * because the server means "that slot is already processing". Every other
 * rejection is thrown as a {@link ProfileVideoUploadError} carrying the
 * localized message key. A 403 also refreshes the supporter status query, since
 * the server is authoritative about entitlement.
 */
export function useProfileVideoUpload() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  return useMutation<
    ProfileVideoUploadResult,
    ProfileVideoUploadError,
    ProfileVideoUploadVariables
  >({
    mutationFn: async ({ file, type, crop }) => {
      try {
        await ProfileService.profileVideoControllerUploadV1({
          file,
          type,
          cropX: crop?.x,
          cropY: crop?.y,
          cropWidth: crop?.width,
          cropHeight: crop?.height,
        });

        return {
          alreadyProcessing: false,
          messageKey: PROFILE_VIDEO_UPLOAD_MESSAGES.accepted,
        };
      } catch (error) {
        if (error instanceof ApiError && error.status === 409) {
          return {
            alreadyProcessing: true,
            messageKey: PROFILE_VIDEO_UPLOAD_MESSAGES.alreadyProcessing,
          };
        }

        throw toUploadError(error);
      }
    },
    onSuccess: () => {
      // Refresh the owner status so the slot flips to processing right away and
      // `useProfileVideoUploads` starts polling.
      void queryClient.invalidateQueries({
        queryKey: ["userProfile", userId, "own"],
      });
    },
    onError: (error) => {
      if (error.status === 403) {
        void queryClient.invalidateQueries({
          queryKey: SUPPORTER_QUERY_KEYS.me,
        });
      }
    },
  });
}
