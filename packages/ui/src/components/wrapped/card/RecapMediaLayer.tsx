import { at } from "#@/components/wrapped/card/recapCardTheme";
import type { RecapCardMedia } from "#@/components/wrapped/card/recapCardTypes";
import { RECAP_OVERLAY_DEFAULT_OPACITY } from "#@/components/wrapped/card/recapCustomization";
import {
  RECAP_MEDIA_FADES,
  RECAP_MEDIA_RECTS,
  type RecapMediaTemplate,
} from "#@/components/wrapped/card/recapMedia";

const GROUND = "15, 14, 13";

/** Whether the user picked a photo or a clip to be the card's background. */
export function hasRecapMedia(
  media: RecapCardMedia | undefined,
): media is RecapCardMedia {
  return !!media && (!!media.video || !!media.photoSrc);
}

interface Props {
  media: RecapCardMedia;
  template: RecapMediaTemplate;
  /** Fills the parent (a tile) instead of the template's media area. */
  fill?: boolean;
}

/**
 * The photo (when there is one) under the overlay that keeps the text
 * readable. With a clip only the overlay is drawn: the encoder (or the
 * preview's video element) puts the clip underneath.
 */
export function RecapMediaLayer({ media, template, fill = false }: Props) {
  const rect = RECAP_MEDIA_RECTS[template];
  const overlay = Math.min(
    1,
    Math.max(0, media.overlayOpacity ?? RECAP_OVERLAY_DEFAULT_OPACITY),
  );
  const scrim = RECAP_MEDIA_FADES[template]
    ? `linear-gradient(to bottom, rgba(${GROUND}, ${overlay}) 0%, rgba(${GROUND}, ${overlay}) 55%, rgba(${GROUND}, 1) 100%)`
    : `rgba(${GROUND}, ${overlay})`;

  return (
    <div
      className={"pointer-events-none overflow-hidden"}
      style={
        fill
          ? { position: "absolute", inset: 0 }
          : {
              ...at(rect.x, rect.y, rect.width, rect.height),
              borderRadius: rect.radius,
            }
      }
    >
      {!media.video && media.photoSrc && (
        <img
          src={media.photoSrc}
          alt={""}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      <div className={"absolute inset-0"} style={{ background: scrim }} />
    </div>
  );
}
