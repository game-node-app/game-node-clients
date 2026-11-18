import {
  getRecapPreviewScale,
  RECAP_CARD_FORMATS,
  RECAP_PREVIEW_MAX_HEIGHT,
  type RecapCardFormat,
} from "#@/components/wrapped/card/recapCardFormats";
import { cn } from "#@/util";
import { useElementSize, useViewportSize } from "@mantine/hooks";
import type { CSSProperties, PropsWithChildren, RefObject } from "react";

interface Props extends PropsWithChildren {
  format: RecapCardFormat;
  /**
   * Points at the native-size card. It sits inside the scaled wrapper but is
   * not scaled itself, so exporting it yields the full-size image.
   */
  cardRef: RefObject<HTMLDivElement | null>;
  /** Fixed preview scale cap; when omitted, fits container width and maxHeight. */
  scale?: number;
  frameClassName?: string;
  frameStyle?: CSSProperties;
  testId?: string;
  /** Overrides the height the preview may take (compact layouts fit the card in one screen). */
  maxHeight?: number;
}

/**
 * Shows the card scaled down to fit the page while keeping the card itself at
 * its native pixel size, which is what gets exported.
 */
export function RecapCardPreview({
  format,
  cardRef,
  scale: scaleOverride,
  frameClassName,
  frameStyle,
  testId = "recap-card",
  maxHeight: maxHeightOverride,
  children,
}: Props) {
  const { ref, width } = useElementSize();
  const { height: viewportHeight } = useViewportSize();
  const size = RECAP_CARD_FORMATS[format];
  // Use the available window height (minus header, title, the stage's
  // label row and format switch, and paddings) so the card fills the preview
  // area on large screens; never below the default.
  const maxHeight =
    maxHeightOverride ??
    Math.max(RECAP_PREVIEW_MAX_HEIGHT, viewportHeight - 300);
  const scale =
    scaleOverride != null
      ? width > 0
        ? Math.min(scaleOverride, width / size.width)
        : scaleOverride
      : getRecapPreviewScale(width, format, maxHeight);

  return (
    <div ref={ref} className={"w-full flex justify-center"}>
      <div
        className={cn(
          "shrink-0 overflow-hidden rounded-md",
          frameClassName,
        )}
        style={{
          width: size.width * scale,
          height: size.height * scale,
          ...frameStyle,
        }}
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
            data-testid={testId}
            style={{ width: size.width, height: size.height }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
