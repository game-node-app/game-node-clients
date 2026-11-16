import { RECAP_COLORS } from "#@/components/wrapped/card/recapCardTheme";
import {
  RECAP_CARD_FORMATS,
  type RecapCardFormat,
} from "#@/components/wrapped/card/recapCardFormats";
import type { RecapMediaRect } from "#@/components/wrapped/card/recapMedia";

/** Longest clip exported; longer files are trimmed from the start. */
export const RECAP_VIDEO_MAX_SECONDS = 15;
const FPS = 30;
const VIDEO_BITRATE = 8_000_000;
const AUDIO_BITRATE = 128_000;
/** H.264 Main L4.0: decodes everywhere (WhatsApp, older Android). */
const AVC_CODEC = "avc1.4d0028";

const abortError = () => new DOMException("Aborted", "AbortError");

/**
 * Cheap synchronous check so the UI can hide the option on browsers without
 * WebCodecs (Firefox, older Safari). The definitive H.264 check happens in
 * {@link exportRecapVideo}.
 */
export function isRecapVideoSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof VideoEncoder !== "undefined" &&
    typeof VideoDecoder !== "undefined" &&
    typeof AudioEncoder !== "undefined" &&
    typeof AudioDecoder !== "undefined"
  );
}

export interface ExportRecapVideoOptions {
  /** The clip that fills the media area of the card. */
  file: File;
  /** The card rendered with a transparent media area and background. */
  overlay: HTMLImageElement;
  /** Format of the card, which sets the size of the video. */
  format: RecapCardFormat;
  /** Where the clip is drawn, in card pixels (see `RECAP_MEDIA_RECTS`). */
  hero: RecapMediaRect;
  /** Called with `0..1`. */
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

/** `object-fit: cover` source rectangle for drawing a `sw`x`sh` frame into `dw`x`dh`. */
function coverCrop(sw: number, sh: number, dw: number, dh: number) {
  const scale = Math.max(dw / sw, dh / sh);
  const width = dw / scale;
  const height = dh / scale;
  return { x: (sw - width) / 2, y: (sh - height) / 2, width, height };
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = RECAP_COLORS.ground;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Composites the clip into the card's media area and encodes the whole card
 * as an MP4 (H.264 + AAC), fully in the browser.
 *
 * Offline pipeline ported from Echo: the clip is demuxed and decoded with
 * mediabunny, sampled onto a fixed 30 fps grid (previous-frame sampling) and
 * drawn per frame as background, video in the hero, then the overlay. Audio
 * is the clip's own track, or silence (some apps reject videos without audio).
 *
 * Throws when the device cannot decode the clip or encode H.264 at the size of
 * the card,
 * and an `AbortError` when `signal` is aborted.
 */
export async function exportRecapVideo({
  file,
  overlay,
  format,
  hero,
  onProgress,
  signal,
}: ExportRecapVideoOptions): Promise<File> {
  if (!isRecapVideoSupported()) {
    throw new Error("Video export is not supported in this browser.");
  }
  if (signal?.aborted) throw abortError();

  const {
    ALL_FORMATS,
    AudioBufferSink,
    AudioBufferSource,
    BlobSource,
    BufferTarget,
    CanvasSink,
    CanvasSource,
    Input,
    Mp4OutputFormat,
    Output,
    canEncodeAudio,
    canEncodeVideo,
  } = await import("mediabunny");

  const { width: canvasW, height: canvasH } = RECAP_CARD_FORMATS[format];

  if (
    !(await canEncodeVideo("avc", {
      width: canvasW,
      height: canvasH,
      bitrate: VIDEO_BITRATE,
    }))
  ) {
    throw new Error(
      `This device cannot encode H.264 at ${canvasW}x${canvasH}.`,
    );
  }

  const input = new Input({
    source: new BlobSource(file),
    formats: ALL_FORMATS,
  });
  let output: InstanceType<typeof Output> | undefined;

  try {
    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) throw new Error("The file has no video track.");
    if (!(await videoTrack.canDecode())) {
      throw new Error("This browser cannot decode the video codec.");
    }

    const displayW = await videoTrack.getDisplayWidth();
    const displayH = await videoTrack.getDisplayHeight();
    const trackDuration = await videoTrack.computeDuration();
    let audioTrack = await input.getPrimaryAudioTrack();
    if (audioTrack && !(await audioTrack.canDecode())) audioTrack = null;

    const duration = Math.min(
      RECAP_VIDEO_MAX_SECONDS,
      Number.isFinite(trackDuration) && trackDuration > 0 ? trackDuration : 1,
    );
    const frameDur = 1 / FPS;
    const totalFrames = Math.max(1, Math.round(duration * FPS));
    const targetSec = totalFrames * frameDur;

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas is not available.");

    const crop = coverCrop(displayW, displayH, hero.width, hero.height);
    const composite = (frame: HTMLCanvasElement | OffscreenCanvas | null) => {
      drawBackground(ctx, canvasW, canvasH);
      if (frame) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(hero.x, hero.y, hero.width, hero.height, hero.radius);
        ctx.clip();
        ctx.drawImage(
          frame,
          crop.x,
          crop.y,
          crop.width,
          crop.height,
          hero.x,
          hero.y,
          hero.width,
          hero.height,
        );
        ctx.restore();
      }
      ctx.drawImage(overlay, 0, 0, canvasW, canvasH);
    };

    const target = new BufferTarget();
    output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }),
      target,
    });
    const videoSource = new CanvasSource(canvas, {
      codec: "avc",
      bitrate: VIDEO_BITRATE,
      fullCodecString: AVC_CODEC,
      keyFrameInterval: 2,
    });
    output.addVideoTrack(videoSource, { frameRate: FPS });
    // Firefox has no AAC encoder: fall back to Opus (also valid in MP4), and
    // to a silent file when the browser can encode neither.
    const audioCodec = (await canEncodeAudio("aac", { bitrate: AUDIO_BITRATE }))
      ? "aac"
      : (await canEncodeAudio("opus", { bitrate: AUDIO_BITRATE }))
        ? "opus"
        : null;
    const audioSource = audioCodec
      ? new AudioBufferSource({ codec: audioCodec, bitrate: AUDIO_BITRATE })
      : null;
    if (audioSource) output.addAudioTrack(audioSource);
    await output.start();

    // ---- Audio: the clip's own track, or silence, spanning the video exactly.
    const rate = audioTrack ? await audioTrack.getSampleRate() : 48000;
    const channels = audioTrack
      ? Math.min(2, Math.max(1, await audioTrack.getNumberOfChannels()))
      : 2;
    const samples = Math.max(1, Math.round(targetSec * rate));
    const pcm = audioSource
      ? new AudioBuffer({
          length: samples,
          sampleRate: rate,
          numberOfChannels: channels,
        })
      : null;
    if (audioTrack && pcm) {
      const sink = new AudioBufferSink(audioTrack);
      for await (const { buffer, timestamp } of sink.buffers(0, targetSec)) {
        const offset = Math.round(timestamp * rate);
        for (let ch = 0; ch < channels; ch++) {
          const src = buffer.getChannelData(
            Math.min(ch, buffer.numberOfChannels - 1),
          );
          const dst = pcm.getChannelData(ch);
          for (let i = 0; i < buffer.length; i++) {
            const at = offset + i;
            if (at >= 0 && at < samples) dst[at] = src[i]!;
          }
        }
      }
    }
    if (audioSource && pcm) {
      await audioSource.add(pcm);
      audioSource.close();
    }
    if (signal?.aborted) throw abortError();

    // ---- Video: fixed 30 fps grid, each slot shows the latest decoded frame.
    const sink = new CanvasSink(videoTrack);
    let lastFrame: HTMLCanvasElement | OffscreenCanvas | null = null;
    let outIdx = 0;

    const flushTo = async (untilSec: number) => {
      while (outIdx < totalFrames && outIdx * frameDur < untilSec) {
        composite(lastFrame);
        // add() waits for encoder backpressure.
        await videoSource.add(outIdx * frameDur, frameDur);
        outIdx++;
        if (outIdx % 5 === 0) onProgress?.(outIdx / totalFrames);
        if (signal?.aborted) throw abortError();
      }
    };

    for await (const wrapped of sink.canvases(0, duration)) {
      await flushTo(wrapped.timestamp);
      if (outIdx >= totalFrames) break;
      lastFrame = wrapped.canvas;
    }
    await flushTo(Infinity);
    videoSource.close();

    await output.finalize();
    const { buffer } = target;
    if (!buffer) throw new Error("Failed to generate the MP4 (empty buffer).");
    onProgress?.(1);

    return new File([buffer], `gamenode-recap-${Date.now()}.mp4`, {
      type: "video/mp4",
    });
  } catch (error) {
    await output?.cancel().catch(() => {});
    if (signal?.aborted) throw abortError();
    throw error;
  } finally {
    input.dispose();
  }
}
