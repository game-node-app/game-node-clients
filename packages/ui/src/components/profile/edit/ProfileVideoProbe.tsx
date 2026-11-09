export interface ProfileVideoProbeProps {
  src: string;
  /** `true` when metadata loaded, `false` when the device cannot preview it. */
  onResult: (previewable: boolean) => void;
}

/**
 * Off-screen `<video>` that decides whether the selected file can be framed
 * locally. HEVC, MOV or Matroska files may be valid on the server but not
 * playable in the current browser, in which case the uploader skips cropping.
 *
 * It stays in the layout (transparent, 1px) instead of `display: none`, so
 * browsers still fetch metadata.
 */
export function ProfileVideoProbe({ src, onResult }: ProfileVideoProbeProps) {
  return (
    <video
      data-testid={"profile-video-probe"}
      src={src}
      preload={"metadata"}
      muted
      playsInline
      aria-hidden={true}
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
      }}
      onLoadedMetadata={() => onResult(true)}
      onError={() => onResult(false)}
    />
  );
}
