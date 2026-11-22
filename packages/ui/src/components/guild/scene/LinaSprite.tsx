import { cn } from "#@/util";

import styles from "../guild.module.css";

import { GuildIcon } from "./GuildIcon";

export type LinaPose = "neutral" | "happy";
export type LinaScale = 5 | 6;

export interface LinaSpriteProps {
  /** `happy` swaps the face for the happy eyes + smile layers (design D4). */
  pose: LinaPose;
  /** Open-mouth layer toggles while the dialogue types (design D5). */
  isTalking: boolean;
  /** 6x desktop (192x204) or 5x mobile (160x170). */
  scale: LinaScale;
  /** Celebrate with four hops before returning to breathing (accepted state). */
  hop?: boolean;
}

const LAYER_SIZE: Record<LinaScale, { width: number; height: number }> = {
  5: { width: 160, height: 170 },
  6: { width: 192, height: 204 },
};

/**
 * Lina as a stack of the six Figma sprite layers. The wrapper breathes (or hops
 * during the accept celebration), the braids answer 100 ms later, and the face
 * layers follow the pose and the typewriter.
 */
export function LinaSprite({
  pose,
  isTalking,
  scale,
  hop = false,
}: LinaSpriteProps) {
  const { width, height } = LAYER_SIZE[scale];
  const isMobile = scale === 5;
  const breathingClass = hop
    ? styles.animHop
    : isMobile
      ? styles.animBreatheMobile
      : styles.animBreathe;
  const braidsClass = isMobile ? styles.animBraidsMobile : styles.animBraids;
  const isHappy = pose === "happy";

  return (
    <div
      className={cn(styles.linaSprite, breathingClass)}
      data-pose={pose}
      data-talking={isTalking}
      style={{ width, height }}
    >
      <GuildIcon
        name="lina-body"
        size={width}
        alt="Lina"
        className={styles.linaLayer}
      />
      <GuildIcon
        name="lina-braids"
        size={width}
        className={cn(styles.linaLayer, braidsClass)}
      />
      {isHappy ? (
        <>
          <GuildIcon
            name="lina-eyes-happy"
            size={width}
            className={styles.linaLayer}
          />
          <GuildIcon
            name="lina-smile"
            size={width}
            className={styles.linaLayer}
          />
        </>
      ) : (
        <>
          {/* Blink only in the neutral pose and never over the talking mouth. */}
          {!isTalking ? (
            <GuildIcon
              name="lina-eyes-closed"
              size={width}
              className={cn(styles.linaLayer, styles.animBlink)}
            />
          ) : null}
          {isTalking ? (
            <GuildIcon
              name="lina-mouth-open"
              size={width}
              className={cn(styles.linaLayer, styles.animTalk)}
            />
          ) : null}
        </>
      )}
    </div>
  );
}
