import { useEffect, useRef, useState } from "react";

type SplashPhase = "pulse" | "fill" | "zoom" | "fade" | "done";

const BG_COLOR = "#1A1A1A";
const BRAND_COLOR = "#F15025";
// minimum time the pulsing logo stays on screen
const MIN_PULSE_MS = 1200;
// gives up waiting for the page to finish loading after this
const MAX_WAIT_MS = 8000;
const FILL_MS = 650;
const ZOOM_MS = 900;
const FADE_MS = 250;

// logo drawn in a 1000x1000 viewBox (node_icon.svg), shown at 0.2 px per unit
const LOGO_SCALE = 0.2;
// center of the logo's hole, which is what the final zoom grows into
const HOLE_CX = 500.5;
const HOLE_CY = 500.15;
const HOLE_W = 287.078;
const HOLE_H = 202.466;
const HOLE_PATH =
  "M644.039 601.383H365.488L356.961 592.976V398.917H635.512L644.039 406.623V601.383Z";
// the fill circle has this radius (px) and is scaled to cover the viewport
const FILL_RADIUS = 100;

const logoTransform = (scale: string) =>
  `scale(calc(${LOGO_SCALE} * ${scale})) translate(-${HOLE_CX}px, -${HOLE_CY}px)`;

/**
 * Shown once per app launch (the JS runtime lives as long as the process), like the native
 * splash it continues. Set when the animation ends, so a StrictMode remount doesn't skip it.
 */
let splashShown = false;

/**
 * Entry animation: the logo pulses on #1A1A1A while the app loads, brand orange grows out of
 * the logo until it fills the screen, then the logo zooms into its hole so the app shows
 * through. Same colours, geometry and timings as the web and Kotlin EntrySplash, and it picks
 * up where the Android launch theme (`windowSplashScreenAnimatedIcon`) leaves off.
 */
export default function EntrySplash() {
  const [phase, setPhase] = useState<SplashPhase>(
    splashShown ? "done" : "pulse",
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (splashShown) return;

    let timer: ReturnType<typeof setTimeout>;
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
      if (reducedMotion) return fadeOut();

      const { innerWidth: w, innerHeight: h } = window;
      const style = rootRef.current?.style;
      style?.setProperty(
        "--gn-fill",
        String(Math.hypot(w, h) / 2 / FILL_RADIUS),
      );
      // 1.15 leaves margin for the hole's chamfered corners
      style?.setProperty(
        "--gn-zoom",
        String(
          Math.max(w / (HOLE_W * LOGO_SCALE), h / (HOLE_H * LOGO_SCALE)) * 1.15,
        ),
      );

      setPhase("fill");
      timer = setTimeout(() => {
        setPhase("zoom");
        timer = setTimeout(fadeOut, ZOOM_MS);
      }, FILL_MS);
    };

    const waitForPage = () => {
      const elapsed = Date.now() - startedAt;
      const loaded =
        document.readyState === "complete" &&
        (document.fonts?.status ?? "loaded") === "loaded";
      if (elapsed >= MAX_WAIT_MS || (elapsed >= MIN_PULSE_MS && loaded)) {
        return start();
      }
      timer = setTimeout(waitForPage, 150);
    };
    waitForPage();

    return () => clearTimeout(timer);
  }, []);

  if (phase === "done") return null;

  const logo = (
    <>
      <path
        d="M159 210V681.146L270.871 789.169L842 790V318.023L730.129 210H159ZM670.409 619.656H340.685L330.591 609.685V379.513H660.315L670.409 388.653V619.656Z"
        fill={BRAND_COLOR}
      />
      <path
        d="M212 256V653.225L306.509 744.299L789 745V347.075L694.491 256H212ZM644.039 601.383H365.488L356.961 592.976V398.917H635.512L644.039 406.623V601.383Z"
        fill="#FFFFFF"
      />
    </>
  );

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="gn-entry-splash"
      data-phase={phase}
      style={{ position: "fixed", inset: 0, zIndex: 99999, overflow: "hidden" }}
    >
      <style>
        {`
          .gn-entry-splash { --gn-fill: 40; --gn-zoom: 40; transition: opacity ${FADE_MS}ms ease-out; }
          .gn-entry-splash:not([data-phase=pulse]) { pointer-events: none; }
          .gn-entry-splash[data-phase=fade] { opacity: 0; }
          @keyframes gn-entry-pulse {
            0%, 100% { transform: ${logoTransform("1")}; }
            50% { transform: ${logoTransform("1.08")}; }
          }
          @keyframes gn-entry-fill {
            from { transform: scale(0); }
            to { transform: scale(var(--gn-fill)); }
          }
          @keyframes gn-entry-zoom {
            from { transform: ${logoTransform("1")}; }
            to { transform: ${logoTransform("var(--gn-zoom)")}; }
          }
          .gn-entry-splash__logo {
            transform: ${logoTransform("1")};
            animation: gn-entry-pulse 1.1s ease-in-out infinite;
          }
          .gn-entry-splash[data-phase=fill] .gn-entry-splash__logo { animation: none; }
          .gn-entry-splash[data-phase=zoom] .gn-entry-splash__logo,
          .gn-entry-splash[data-phase=fade] .gn-entry-splash__logo {
            animation: gn-entry-zoom ${ZOOM_MS}ms cubic-bezier(0.7, 0, 0.84, 0) forwards;
          }
          .gn-entry-splash__fill { transform: scale(0); }
          .gn-entry-splash[data-phase=fill] .gn-entry-splash__fill {
            animation: gn-entry-fill ${FILL_MS}ms ease-in-out forwards;
          }
          .gn-entry-splash[data-phase=zoom] .gn-entry-splash__fill,
          .gn-entry-splash[data-phase=fade] .gn-entry-splash__fill { transform: scale(var(--gn-fill)); }
          /* plug hides the app behind the hole until the zoom starts */
          .gn-entry-splash__plug { transition: opacity 120ms ease-out; }
          .gn-entry-splash[data-phase=zoom] .gn-entry-splash__plug,
          .gn-entry-splash[data-phase=fade] .gn-entry-splash__plug { opacity: 0; }
          @media (prefers-reduced-motion: reduce) {
            .gn-entry-splash .gn-entry-splash__logo { animation: none !important; }
          }
        `}
      </style>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          {/* opaque layer with a logo-hole cutout: the app shows through the hole as it grows */}
          <mask
            id="gn-entry-splash-mask"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            <rect width="100%" height="100%" fill="white" />
            <svg x="50%" y="50%" overflow="visible">
              <g className="gn-entry-splash__logo">
                <path d={HOLE_PATH} fill="black" />
              </g>
            </svg>
          </mask>
        </defs>
        <g mask="url(#gn-entry-splash-mask)">
          <rect width="100%" height="100%" fill={BG_COLOR} />
          <svg x="50%" y="50%" overflow="visible">
            <circle
              className="gn-entry-splash__fill"
              r={FILL_RADIUS}
              fill={BRAND_COLOR}
            />
          </svg>
        </g>
        <svg x="50%" y="50%" overflow="visible">
          <g className="gn-entry-splash__logo">
            <path
              className="gn-entry-splash__plug"
              d={HOLE_PATH}
              fill={BG_COLOR}
            />
            {logo}
          </g>
        </svg>
      </svg>
    </div>
  );
}
