import type { RecapStoryId } from "#@/components/recap/stories/recapStories";
import {
  at,
  monoStyle,
  RECAP_COLORS,
  RECAP_FONTS,
} from "#@/components/wrapped/card/recapCardTheme";
import type { ReactNode } from "react";

interface Props {
  storyId: RecapStoryId;
  /** Small editorial label at the top of the card. */
  eyebrow: string;
  /** Wide art drawn behind the content, e.g. the top game's backdrop. */
  backdrop?: ReactNode;
  children: ReactNode;
}

/**
 * Native 1080x1920 frame shared by the five stories. Everything is laid out
 * in card pixels so the exported PNG matches the preview (design §11).
 */
export function RecapStoryFrame({
  storyId,
  eyebrow,
  backdrop,
  children,
}: Props) {
  return (
    <div
      data-testid={`recap-story-${storyId}`}
      data-gn-scope={"dark"}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: RECAP_COLORS.ground,
        color: RECAP_COLORS.cream,
        fontFamily: RECAP_FONTS.display,
      }}
    >
      {backdrop}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          // theme-exempt: recap story artwork backdrop
          background:
            "radial-gradient(760px 540px at 100% 0%, rgba(241,80,37,0.22), transparent 70%), linear-gradient(180deg, rgba(15,14,13,0.25) 0%, rgba(15,14,13,0.86) 58%, #0F0E0D 100%)",
        }}
      />
      <div style={at(64, 104, 952)}>
        <span style={monoStyle(26, RECAP_COLORS.brand)}>{eyebrow}</span>
      </div>
      {children}
      <div
        style={{
          ...at(64, 1812, 952),
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={monoStyle(24, RECAP_COLORS.dim)}>GameNode</span>
        <span style={monoStyle(20, RECAP_COLORS.dim, false)}>gamenode.app</span>
      </div>
    </div>
  );
}
