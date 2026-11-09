import { cn } from "#@/util";

export interface ProfileVideoPreviewProps {
  src: string;
  /** Output aspect ratio of the slot (1 for avatars, 1280/548 for banners). */
  aspect: number;
  className?: string;
}

/** Local preview of a selected video, filling the slot's crop area. */
export function ProfileVideoPreview({
  src,
  aspect,
  className,
}: ProfileVideoPreviewProps) {
  return (
    <video
      data-testid={"profile-video-preview"}
      src={src}
      muted
      loop
      playsInline
      autoPlay
      className={cn("w-full object-cover", className)}
      style={{ aspectRatio: String(aspect) }}
    />
  );
}
