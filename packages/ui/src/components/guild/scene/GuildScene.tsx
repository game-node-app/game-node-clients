import type { ReactNode } from "react";
import { useTranslation } from "@repo/locales";
import { cn } from "#@/util";

import styles from "../guild.module.css";

import type { GuildAssetName } from "./assets";
import { GuildIcon } from "./GuildIcon";
import { LinaSprite, type LinaPose, type LinaScale } from "./LinaSprite";

export type GuildSceneVariant = "desktop" | "mobile";

export interface GuildSceneProps {
  variant: GuildSceneVariant;
  pose: LinaPose;
  isTalking: boolean;
  /** Shows the bobbing `!` balloon (design D6/D5). */
  showAlert: boolean;
  /**
   * Desktop dialogue overlay, positioned at top 150 / right 40 (design D6).
   * The mobile composition renders the dialogue below the scene, never over it.
   */
  dialogue?: ReactNode;
}

interface PaperConfig {
  left: number;
  top: number;
  width: number;
  height: number;
  rotate: number;
  brand?: boolean;
}

/** Six pinned papers inside the wall quest board (design D6). */
const DESKTOP_PAPERS: PaperConfig[] = [
  { left: 6, top: 10, width: 52, height: 60, rotate: 4 },
  { left: 74, top: 3, width: 56, height: 46, rotate: -3 },
  { left: 140, top: 14, width: 60, height: 70, rotate: 2, brand: true },
  { left: 18, top: 78, width: 60, height: 48, rotate: -2 },
  { left: 87, top: 64, width: 44, height: 64, rotate: 3 },
  { left: 144, top: 86, width: 58, height: 40, rotate: -4 },
];

const DESKTOP_PROPS: { name: GuildAssetName; left: number; top: number }[] = [
  { name: "mug", left: 700, top: 62 },
  { name: "milk", left: 770, top: 50 },
  { name: "milk", left: 812, top: 50 },
  { name: "plant", left: 870, top: 62 },
  { name: "mug", left: 930, top: 62 },
  { name: "bell", left: 40, top: 216 },
  { name: "ledger", left: 400, top: 204 },
  { name: "inkpot", left: 504, top: 204 },
  { name: "stamp", left: 470, top: 222 },
  { name: "milk", left: 540, top: 204 },
  { name: "milk", left: 580, top: 204 },
];

const MOBILE_PROPS: { name: GuildAssetName; left: number; top: number }[] = [
  { name: "milk", left: 250, top: 60 },
  { name: "plant", left: 310, top: 72 },
  { name: "bell", left: 6, top: 166 },
  { name: "ledger", left: 226, top: 154 },
  { name: "stamp", left: 336, top: 172 },
];

interface SceneArtProps {
  name: GuildAssetName;
  left: number;
  top: number;
  /** Rendered width; the height follows the artwork ratio. */
  size?: number;
  className?: string;
  alt?: string;
}

function SceneArt({ name, left, top, size, className, alt }: SceneArtProps) {
  return (
    <span className={styles.sceneArt} style={{ left, top }}>
      <GuildIcon name={name} size={size} alt={alt} className={className} />
    </span>
  );
}

function QuestPapers() {
  const { t } = useTranslation();

  return (
    <div className={styles.sceneBoard}>
      <span className={cn(styles.pixelLabel, styles.sceneBoardSign)}>
        {t("guild.scene.boardSign")}
      </span>
      {DESKTOP_PAPERS.map((paper, index) => (
        <div
          key={index}
          className={styles.scenePaperWrap}
          data-paper={index + 1}
          style={{
            left: paper.left,
            top: paper.top,
            width: paper.width,
            height: paper.height,
            transform: `rotate(${paper.rotate}deg)`,
          }}
        >
          <div
            className={cn(
              styles.scenePaper,
              paper.brand && styles.scenePaperBrand,
              index % 2 === 0 ? styles.animSway : styles.animSwayAlt,
            )}
          >
            <span className={styles.scenePaperTack} />
            <span
              className={cn(styles.scenePaperLine, styles.scenePaperLine1)}
            />
            <span
              className={cn(styles.scenePaperLine, styles.scenePaperLine2)}
            />
            <span
              className={cn(styles.scenePaperLine, styles.scenePaperLine3)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The Guild hall scene from design D6: a 1280x360 stage on desktop (centered,
 * the sides crop symmetrically) and a 390x280 composition on mobile. Wall and
 * counter layers span the container; the art lives on the fixed-width stage.
 */
export function GuildScene({
  variant,
  pose,
  isTalking,
  showAlert,
  dialogue,
}: GuildSceneProps) {
  const isMobile = variant === "mobile";
  const linaScale: LinaScale = isMobile ? 5 : 6;
  const props = isMobile ? MOBILE_PROPS : DESKTOP_PROPS;

  return (
    <div
      className={cn(
        styles.scene,
        isMobile ? styles.sceneMobile : styles.sceneDesktop,
      )}
      data-variant={variant}
      data-gn-artwork=""
    >
      <div
        className={cn(
          styles.scenePlanks,
          isMobile ? styles.scenePlanksMobile : styles.scenePlanksDesktop,
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          styles.sceneBeam,
          isMobile ? styles.sceneBeamMobile : styles.sceneBeamDesktop,
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          styles.sceneWainscot,
          isMobile ? styles.sceneWainscotMobile : styles.sceneWainscotDesktop,
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          styles.sceneRail,
          isMobile ? styles.sceneRailMobile : styles.sceneRailDesktop,
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          styles.sceneStage,
          isMobile ? styles.sceneStageMobile : styles.sceneStageDesktop,
        )}
      >
        {!isMobile ? <QuestPapers /> : null}

        <span
          className={cn(
            styles.sceneArt,
            styles.sceneShelf,
            isMobile ? styles.sceneShelfMobile : styles.sceneShelfDesktop,
          )}
          aria-hidden="true"
        />
        {!isMobile ? (
          <>
            <span
              className={cn(styles.sceneArt, styles.sceneBracket)}
              style={{ left: 710, top: 120 }}
              aria-hidden="true"
            />
            <span
              className={cn(styles.sceneArt, styles.sceneBracket)}
              style={{ left: 962, top: 120 }}
              aria-hidden="true"
            />
          </>
        ) : null}

        {props.map((prop, index) => (
          <SceneArt
            key={`${prop.name}-${index}`}
            name={prop.name}
            left={prop.left}
            top={prop.top}
          />
        ))}

        <SceneArt
          name="lantern-glow"
          left={isMobile ? 230 : -30}
          top={isMobile ? 0 : 20}
          size={isMobile ? 170 : undefined}
          className={styles.animLantern}
        />
        <SceneArt
          name="lantern"
          left={isMobile ? 292 : 56}
          top={isMobile ? 44 : 70}
        />

        <div
          className={styles.sceneArt}
          style={{ left: isMobile ? 48 : 170, top: isMobile ? 52 : 82 }}
        >
          <LinaSprite pose={pose} isTalking={isTalking} scale={linaScale} />
        </div>

        {showAlert ? (
          <SceneArt
            name="alert-bubble"
            left={isMobile ? 196 : 336}
            top={isMobile ? 22 : 44}
            className={styles.animAlert}
          />
        ) : null}

        <div
          className={cn(
            styles.sceneCounter,
            isMobile ? styles.sceneCounterMobile : styles.sceneCounterDesktop,
          )}
          aria-hidden="true"
        >
          <div
            className={cn(
              styles.sceneCounterFront,
              isMobile
                ? styles.sceneCounterFrontMobile
                : styles.sceneCounterFrontDesktop,
              isMobile
                ? styles.sceneCounterJointsMobile
                : styles.sceneCounterJointsDesktop,
            )}
          />
          <div
            className={cn(
              styles.sceneCounterEdge,
              isMobile
                ? styles.sceneCounterEdgeMobile
                : styles.sceneCounterEdgeDesktop,
            )}
          />
          <div
            className={cn(
              styles.sceneCounterTop,
              isMobile
                ? styles.sceneCounterTopMobile
                : styles.sceneCounterTopDesktop,
            )}
          />
          <div className={styles.sceneCounterOutline} />
        </div>
      </div>

      {!isMobile && dialogue ? (
        <div className={styles.sceneDialogueSlot} data-scene-dialogue="desktop">
          {dialogue}
        </div>
      ) : null}
    </div>
  );
}
