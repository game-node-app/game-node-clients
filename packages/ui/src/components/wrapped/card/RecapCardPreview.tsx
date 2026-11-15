import {
  getRecapPreviewScale,
  RECAP_CARD_FORMATS,
  RECAP_PREVIEW_MAX_HEIGHT,
  type RecapCardFormat,
} from "#@/components/wrapped/card/recapCardFormats";
import { useElementSize, useViewportSize } from "@mantine/hooks";
import type { PropsWithChildren, RefObject } from "react";

interface Props extends PropsWithChildren {
  format: RecapCardFormat;
  /**
   * Points at the native-size card. It sits inside the scaled wrapper but is
   * not scaled itself, so exporting it yields the full-size image.
   */
  cardRef: RefObject<HTMLDivElement | null>;
}

/**
 * Shows the card scaled down to fit the page while keeping the card itself at
 * its native pixel size, which is what gets exported.
 */
export function RecapCardPreview({ format, cardRef, children }: Props) {
  const { ref, width } = useElementSize();
  const { height: viewportHeight } = useViewportSize();
  const size = RECAP_CARD_FORMATS[format];
  // Use the available window height (minus header, title and paddings) so the
  // card fills the preview area on large screens; never below the default.
  const maxHeight = Math.max(RECAP_PREVIEW_MAX_HEIGHT, viewportHeight - 200);
  const scale = getRecapPreviewScale(width, format, maxHeight);

  return (
    <div ref={ref} className={"w-full flex justify-center"}>
      <div
        className={"shrink-0 overflow-hidden rounded-md"}
        style={{ width: size.width * scale, height: size.height * scale }}
      >
        <div
          style={{
            width: size.width,
            height: size.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            ref={cardRef}
            data-testid={"recap-card"}
            style={{ width: size.width, height: size.height }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
