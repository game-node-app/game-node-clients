import { useProfileVideoPlayback } from "#@/components/profile/hooks/useProfileVideoPlayback";
import { cn } from "#@/util/cn";
import { getS3StoredUpload } from "#@/util/getServerStoredImages";
import { Box } from "@mantine/core";

/** Stored file fields shared by both profile video slots. */
export interface ProfileVideoFile {
  filename: string;
  extension: string;
}

export interface ProfileVideoProps {
  /** Published video for the slot; `null`/`undefined` renders nothing. */
  video: ProfileVideoFile | null | undefined;
  /** Image shown before the video mounts and used as its poster. */
  poster?: string;
  /** Extra classes for the container (e.g. positioning); the media fills it. */
  className?: string;
}

/**
 * Plays a published profile video muted, looping and inline.
 *
 * Mounts the `<video>` only near the viewport, keeps the poster image while it
 * is unmounted, and falls back to the poster permanently when the user prefers
 * reduced motion or playback fails.
 */
export function ProfileVideo({ video, poster, className }: ProfileVideoProps) {
  const { containerRef, videoRef, shouldMountVideo } = useProfileVideoPlayback({
    enabled: video != null,
    resetKey: video ? `${video.filename}.${video.extension}` : undefined,
  });

  if (!video) return null;

  const src = getS3StoredUpload(`${video.filename}.${video.extension}`);

  return (
    <Box
      ref={containerRef}
      className={cn("pointer-events-none relative h-full w-full", className)}
    >
      {shouldMountVideo ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden
          data-testid={"profile-video"}
          className={"h-full w-full object-cover"}
        />
      ) : (
        poster != undefined && (
          <img
            src={poster}
            alt={""}
            data-testid={"profile-video-poster"}
            className={"h-full w-full object-cover"}
          />
        )
      )}
    </Box>
  );
}
