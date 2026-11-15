import type { VideoCropArea } from "#@/components/profile/util/normalizeVideoCrop";

export type ProfileVideoSlot = "avatar" | "banner";

type SlotSpec = {
  width: number;
  height: number;
  /** Target bitrate in bit/s, close to what the server renders. */
  bitrate: number;
};

/** Same output geometry as the server conversion (`media-process.ts`). */
export const PROFILE_VIDEO_SLOT_SPECS: Record<ProfileVideoSlot, SlotSpec> = {
  avatar: { width: 256, height: 256, bitrate: 900_000 },
  banner: { width: 1280, height: 548, bitrate: 4_000_000 },
};

/** The server keeps at most 8 seconds. */
export const PROFILE_VIDEO_MAX_SECONDS = 8;
export const PROFILE_VIDEO_MAX_FPS = 30;

export type PixelCrop = {
  left: number;
  top: number;
  width: number;
  height: number;
};

const toEven = (value: number) => Math.max(2, Math.floor(value / 2) * 2);

/**
 * Pixel crop rectangle for a video as displayed (rotation already applied).
 *
 * With cropper percentages (`0..100`, as reported by `react-easy-crop`) the
 * framed area is used. Without them (the video could not be previewed) the
 * largest centered rectangle with the slot aspect is used, which mirrors the
 * server's center crop. Every value is even, as yuv420p requires.
 */
export function computeCropRect(
  displayWidth: number,
  displayHeight: number,
  slot: ProfileVideoSlot,
  percentages?: VideoCropArea,
): PixelCrop {
  if (percentages) {
    const left = Math.max(0, (percentages.x / 100) * displayWidth);
    const top = Math.max(0, (percentages.y / 100) * displayHeight);
    const width = toEven(
      Math.min((percentages.width / 100) * displayWidth, displayWidth - left),
    );
    const height = toEven(
      Math.min((percentages.height / 100) * displayHeight, displayHeight - top),
    );

    return {
      left: Math.floor(left),
      top: Math.floor(top),
      width,
      height,
    };
  }

  const spec = PROFILE_VIDEO_SLOT_SPECS[slot];
  const targetAspect = spec.width / spec.height;
  const sourceAspect = displayWidth / displayHeight;
  const width = toEven(
    sourceAspect > targetAspect ? displayHeight * targetAspect : displayWidth,
  );
  const height = toEven(
    sourceAspect > targetAspect ? displayHeight : displayWidth / targetAspect,
  );

  return {
    left: Math.floor((displayWidth - width) / 2),
    top: Math.floor((displayHeight - height) / 2),
    width,
    height,
  };
}

/**
 * The prepared file is only worth sending when it is actually smaller than
 * the original; otherwise the original goes up and the server crops it.
 */
export function shouldUsePreparedVideo(
  originalSize: number,
  preparedSize: number,
): boolean {
  return preparedSize > 0 && preparedSize < originalSize;
}

/**
 * Cheap synchronous check, so the UI can decide without loading the encoder.
 * The definitive check (H.264 encodable at the target size) happens inside
 * {@link prepareProfileVideo}.
 */
export function isVideoPreparationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof VideoEncoder !== "undefined" &&
    typeof VideoDecoder !== "undefined"
  );
}

export type PrepareProfileVideoOptions = {
  file: File;
  slot: ProfileVideoSlot;
  /** Cropper output (`0..100`); omitted when the video could not be previewed. */
  cropPercentages?: VideoCropArea;
  /** Called with `0..1`. */
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
};

const abortError = () => new DOMException("Aborted", "AbortError");

/**
 * Crops, scales and re-encodes the video in the browser (WebCodecs through
 * mediabunny): framed area only, slot resolution, at most 8 s and 30 fps, no
 * audio, H.264 in MP4. The server still converts the result, so this only
 * shrinks what is uploaded.
 *
 * Resolves to `null` whenever the device cannot do it or anything fails, so
 * the caller falls back to uploading the original file. Rejects with an
 * `AbortError` only when `signal` is aborted.
 */
export async function prepareProfileVideo({
  file,
  slot,
  cropPercentages,
  onProgress,
  signal,
}: PrepareProfileVideoOptions): Promise<File | null> {
  if (!isVideoPreparationSupported()) return null;
  if (signal?.aborted) throw abortError();

  let input: import("mediabunny").Input | undefined;
  let conversion: import("mediabunny").Conversion | undefined;
  const onAbort = () => {
    void conversion?.cancel();
  };

  try {
    const {
      ALL_FORMATS,
      BlobSource,
      BufferTarget,
      Conversion,
      Input,
      Mp4OutputFormat,
      Output,
      canEncodeVideo,
    } = await import("mediabunny");

    const spec = PROFILE_VIDEO_SLOT_SPECS[slot];
    if (
      !(await canEncodeVideo("avc", {
        width: spec.width,
        height: spec.height,
        bitrate: spec.bitrate,
      }))
    ) {
      return null;
    }

    input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) return null;

    const crop = computeCropRect(
      videoTrack.displayWidth,
      videoTrack.displayHeight,
      slot,
      cropPercentages,
    );

    const target = new BufferTarget();
    const output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }),
      target,
    });

    conversion = await Conversion.init({
      input,
      output,
      trim: { start: 0, end: PROFILE_VIDEO_MAX_SECONDS },
      video: {
        crop,
        width: spec.width,
        height: spec.height,
        fit: "cover",
        frameRate: PROFILE_VIDEO_MAX_FPS,
        codec: "avc",
        bitrate: spec.bitrate,
        // Bake rotation into the frames so the crop and the result match.
        allowTransformationMetadata: false,
      },
      audio: { discard: true },
      showWarnings: false,
    });

    if (!conversion.isValid) return null;

    conversion.onProgress = (progress) => onProgress?.(progress);
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) throw abortError();

    await conversion.execute();
    if (signal?.aborted) throw abortError();

    const buffer = target.buffer;
    if (!buffer) return null;

    const prepared = new File([buffer], "profile-video.mp4", {
      type: "video/mp4",
    });

    return shouldUsePreparedVideo(file.size, prepared.size) ? prepared : null;
  } catch (error) {
    if (signal?.aborted) throw abortError();
    console.warn("Profile video preparation failed, using the original", error);
    return null;
  } finally {
    signal?.removeEventListener("abort", onAbort);
    input?.dispose();
  }
}
