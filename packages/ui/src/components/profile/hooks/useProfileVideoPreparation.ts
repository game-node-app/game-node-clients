import { useRef, useState } from "react";
import type { VideoCropArea } from "#@/components/profile/util/normalizeVideoCrop";
import {
  prepareProfileVideo,
  type ProfileVideoSlot,
} from "#@/components/profile/util/prepareProfileVideo";

export type PrepareVideoVariables = {
  file: File;
  slot: ProfileVideoSlot;
  cropPercentages?: VideoCropArea;
};

export type PrepareVideoResult =
  /** The reduced file to upload in place of the original. */
  | { status: "prepared"; file: File }
  /** Unsupported or failed: upload the original with the normalized crop. */
  | { status: "fallback" }
  /** The user cancelled; nothing should be uploaded. */
  | { status: "cancelled" };

/**
 * Runs {@link prepareProfileVideo} with progress and cancellation state for
 * the video uploaders. It never rejects: failures become `fallback`.
 */
export function useProfileVideoPreparation() {
  const [isPreparing, setIsPreparing] = useState(false);
  const [progress, setProgress] = useState(0);
  const controllerRef = useRef<AbortController | null>(null);

  const prepare = async (
    variables: PrepareVideoVariables,
  ): Promise<PrepareVideoResult> => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setProgress(0);
    setIsPreparing(true);

    try {
      const file = await prepareProfileVideo({
        ...variables,
        onProgress: setProgress,
        signal: controller.signal,
      });

      return file ? { status: "prepared", file } : { status: "fallback" };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return { status: "cancelled" };
      }
      return { status: "fallback" };
    } finally {
      controllerRef.current = null;
      setIsPreparing(false);
    }
  };

  const cancel = () => {
    controllerRef.current?.abort();
  };

  return { isPreparing, progress, prepare, cancel };
}
