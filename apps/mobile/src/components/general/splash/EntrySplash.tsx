import { useEffect, useState } from "react";

type SplashPhase = "pulse" | "fill" | "zoom" | "fade" | "done";

const BG_COLOR = "var(--gn-mobile-splash-background)";
const BRAND_COLOR = "var(--gn-brand)";
const LOGO_INNER_COLOR = "var(--gn-text)";
// minimum time the pulsing logo stays on screen
const MIN_PULSE_MS = 1200;
// gives up waiting for the page to finish loading after this
const MAX_WAIT_MS = 8000;
const FILL_MS = 650;
const ZOOM_MS = 900;
const FADE_MS = 250;
const ZOOM_END_EARLY_MS = 60;
// before the fill starts, wait for this many frames in a row under CALM_FRAME_MS: page load
// is when the app does its heaviest startup work, and an animation started during a stall
// shows up already half-way through
const CALM_FRAMES = 6;
const CALM_FRAME_MS = 40;
const MAX_CALM_WAIT_MS = 1500;
// splash layers are this opaque instead of fully: indistinguishable on screen, but the
// browser then keeps rendering the app behind them, so it is ready when the hole reveals it
// (a fully covered app is skipped and has to be drawn all at once on that frame)
const SPLASH_ALPHA = 0.995;

// logo drawn in a 1000x1000 viewBox (node_icon.svg), shown at 0.2 px per unit
const LOGO_SCALE = 0.2;
const LOGO_PX = 1000 * LOGO_SCALE;
// center of the logo's hole, which is what the final zoom grows into
const HOLE_CX = 500.5;
const HOLE_CY = 500.15;
const HOLE_W = 287.078;
const HOLE_H = 202.466;
const HOLE_PATH =
  "M644.039 601.383H365.488L356.961 592.976V398.917H635.512L644.039 406.623V601.383Z";
const LOGO_OUTER_PATH =
  "M159 210V681.146L270.871 789.169L842 790V318.023L730.129 210H159ZM670.409 619.656H340.685L330.591 609.685V379.513H660.315L670.409 388.653V619.656Z";
const LOGO_INNER_PATH =
  "M212 256V653.225L306.509 744.299L789 745V347.075L694.491 256H212ZM644.039 601.383H365.488L356.961 592.976V398.917H635.512L644.039 406.623V601.383Z";
// brand accent around the zoom frame, in px at scale 1: must reach past the viewport edges
const FRAME_REACH = 3000;

// hole centre inside the logo box, in px: everything is positioned so it sits on the screen centre
const HOLE_X = HOLE_CX * LOGO_SCALE;
const HOLE_Y = HOLE_CY * LOGO_SCALE;

/**
 * Shown once per app launch (the JS runtime lives as long as the process), like the native
 * splash it continues. Set when the animation ends, so a StrictMode remount doesn't skip it.
 */
let splashShown = false;

/** Fill circle radius and hole zoom that cover the viewport. */
function coverScales() {
  const { innerWidth: w, innerHeight: h } = window;
  return {
    fillRadius: Math.ceil(Math.hypot(w, h) / 2) + 2,
    // 1.15 leaves margin for the hole's chamfered corners
    zoom: Math.max(w / (HOLE_W * LOGO_SCALE), h / (HOLE_H * LOGO_SCALE)) * 1.15,
  };
}

/**
 * Entry animation: the logo pulses on the theme background while the app loads, the theme's
 * brand accent grows out of the logo until it fills the screen, then the logo zooms into its
 * hole so the app shows through. Same geometry and timings as the web and Kotlin EntrySplash,
 * and it picks up where the Android launch theme (`windowSplashScreenAnimatedIcon`) leaves off.
 * Colors come from the generated tokens, so the animation follows the active theme.
 *
 * It runs while the app is still booting, so every moving part is an HTML layer animated
 * only through `transform` and `opacity` with plain-number keyframes: the compositor plays
 * them on its own thread without repainting, however busy the main thread is. No SVG mask
 * or SVG-internal animation, which repaint the whole screen on the main thread each frame.
 * The hole reveal uses a "frame" layer instead of a mask: brand everywhere except the
 * transparent hole, which is swapped in once the fill has covered the screen and scaled up.
 */
export default function EntrySplash() {
  const [phase, setPhase] = useState<SplashPhase>(
    splashShown ? "done" : "pulse",
  );
  const [scales, setScales] = useState({ fillRadius: 1000, zoom: 40 });

  useEffect(() => {
    if (splashShown) return;

    let timer: ReturnType<typeof setTimeout>;
    let frame: number | undefined;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const startedAt = Date.now();

    const fadeOut = () => {
      splashShown = true;
      setPhase("fade");
      timer = setTimeout(() => setPhase("done"), FADE_MS);
    };

    const start = () => {
      setScales(coverScales());
      setPhase("fill");
      timer = setTimeout(() => {
        setPhase("zoom");
        // the hole covers the screen just before the zoom ends: drop the frame then, before
        // the finished animation makes the browser redraw it at full zoom (a long stall)
        timer = setTimeout(fadeOut, ZOOM_MS - ZOOM_END_EARLY_MS);
      }, FILL_MS);
    };

    const waitForCalm = () => {
      if (typeof requestAnimationFrame !== "function") return start();
      const since = Date.now();
      let last = since;
      let calm = 0;
      const tick = () => {
        const now = Date.now();
        calm = now - last < CALM_FRAME_MS ? calm + 1 : 0;
        last = now;
        if (calm >= CALM_FRAMES || now - since >= MAX_CALM_WAIT_MS) {
          return start();
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const waitForPage = () => {
      const elapsed = Date.now() - startedAt;
      const loaded =
        document.readyState === "complete" &&
        (document.fonts?.status ?? "loaded") === "loaded";
      if (elapsed >= MAX_WAIT_MS || (elapsed >= MIN_PULSE_MS && loaded)) {
        if (reducedMotion) return fadeOut();
        return elapsed >= MAX_WAIT_MS ? start() : waitForCalm();
      }
      timer = setTimeout(waitForPage, 150);
    };
    waitForPage();

    return () => {
      clearTimeout(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, []);

  if (phase === "done") return null;

  // Logo box, positioned so the hole centre lands on the screen centre.
  const logoBox = {
    position: "absolute",
    left: `calc(50% - ${HOLE_X}px)`,
    top: `calc(50% - ${HOLE_Y}px)`,
    width: LOGO_PX,
    height: LOGO_PX,
  } as const;

  return (
    <div
      aria-hidden
      className="gn-entry-splash"
      data-phase={phase}
      style={{ position: "fixed", inset: 0, zIndex: 99999, overflow: "hidden" }}
    >
      <style>
        {`
          .gn-entry-splash { contain: strict; transition: opacity ${FADE_MS}ms ease-out; }
          .gn-entry-splash:not([data-phase=pulse]) { pointer-events: none; }
          .gn-entry-splash[data-phase=fade] { opacity: 0; }
          .gn-entry-splash__bg { position: absolute; inset: 0; background: ${BG_COLOR}; opacity: ${SPLASH_ALPHA}; }
          @keyframes gn-entry-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          @keyframes gn-entry-fill {
            from { transform: scale(0); }
            to { transform: scale(1); }
          }
          @keyframes gn-entry-zoom {
            from { transform: scale(1); }
            to { transform: scale(${scales.zoom}); }
          }
          @keyframes gn-entry-plug {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          .gn-entry-splash__logo {
            transform-origin: ${HOLE_X}px ${HOLE_Y}px;
            will-change: transform;
            animation: gn-entry-pulse 1.1s ease-in-out infinite;
          }
          .gn-entry-splash[data-phase=fill] .gn-entry-splash__logo { animation: none; }
          .gn-entry-splash__fill {
            position: absolute;
            left: calc(50% - ${scales.fillRadius}px);
            top: calc(50% - ${scales.fillRadius}px);
            width: ${scales.fillRadius * 2}px;
            height: ${scales.fillRadius * 2}px;
            border-radius: 50%;
            background: ${BRAND_COLOR};
            opacity: ${SPLASH_ALPHA};
            transform: scale(0);
          }
          .gn-entry-splash[data-phase=fill] .gn-entry-splash__fill {
            animation: gn-entry-fill ${FILL_MS}ms ease-in-out forwards;
          }
          /* zoom frame: replaces the layers below once the fill has covered the screen. It is
             on screen (nearly transparent) from the start, so it is already rasterised when the
             zoom begins instead of stalling that first frame. */
          .gn-entry-splash__frame {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 0;
            height: 0;
            transform-origin: 0 0;
            opacity: 0.001;
            will-change: transform, opacity;
          }
          .gn-entry-splash[data-phase=zoom] .gn-entry-splash__under,
          .gn-entry-splash[data-phase=fade] .gn-entry-splash__under { visibility: hidden; }
          .gn-entry-splash[data-phase=fade] .gn-entry-splash__frame { display: none; }
          .gn-entry-splash[data-phase=zoom] .gn-entry-splash__frame {
            opacity: 1;
            animation: gn-entry-zoom ${ZOOM_MS}ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
          }
          /* plug hides the app behind the hole until the zoom starts */
          .gn-entry-splash[data-phase=zoom] .gn-entry-splash__plug {
            animation: gn-entry-plug 120ms ease-out forwards;
          }
          @media (prefers-reduced-motion: reduce) {
            .gn-entry-splash .gn-entry-splash__logo { animation: none !important; }
          }
        `}
      </style>

      <div className="gn-entry-splash__bg gn-entry-splash__under" />
      <div className="gn-entry-splash__fill gn-entry-splash__under" />
      <div
        className="gn-entry-splash__logo gn-entry-splash__under"
        style={logoBox}
      >
        <svg viewBox="0 0 1000 1000" width={LOGO_PX} height={LOGO_PX}>
          <path d={HOLE_PATH} style={{ fill: BG_COLOR }} />
          <path d={LOGO_OUTER_PATH} style={{ fill: BRAND_COLOR }} />
          <path d={LOGO_INNER_PATH} style={{ fill: LOGO_INNER_COLOR }} />
        </svg>
      </div>

      <div className="gn-entry-splash__frame">
        {/* brand beyond the logo box: a thick border around a box 1px smaller than it, so the
            two overlap instead of leaving a seam */}
        <div
          style={{
            position: "absolute",
            left: -HOLE_X + 1 - FRAME_REACH,
            top: -HOLE_Y + 1 - FRAME_REACH,
            width: LOGO_PX - 2,
            height: LOGO_PX - 2,
            boxSizing: "content-box",
            border: `${FRAME_REACH}px solid ${BRAND_COLOR}`,
          }}
        />
        <svg
          viewBox="0 0 1000 1000"
          width={LOGO_PX}
          height={LOGO_PX}
          style={{ position: "absolute", left: -HOLE_X, top: -HOLE_Y }}
        >
          {/* brand square with the hole cut out, then the contrast ring on top */}
          <path
            d={`M0 0H1000V1000H0Z${HOLE_PATH}`}
            style={{ fill: BRAND_COLOR }}
            fillRule="evenodd"
          />
          <path d={LOGO_INNER_PATH} style={{ fill: LOGO_INNER_COLOR }} />
        </svg>
        <svg
          className="gn-entry-splash__plug"
          viewBox="0 0 1000 1000"
          width={LOGO_PX}
          height={LOGO_PX}
          style={{ position: "absolute", left: -HOLE_X, top: -HOLE_Y }}
        >
          <path d={HOLE_PATH} style={{ fill: BG_COLOR }} />
        </svg>
      </div>
    </div>
  );
}
