/**
 * Boot choreography (Figma `5639:1053`), in milliseconds from the start:
 * cursor 0-200, log 200-1450 (one line every ~35ms), flash 1450-1550,
 * lockup + OK 1550-2000, cut to the app by ~2200.
 */
export const BOOT_TIMELINE = {
  cursorEnd: 200,
  logEnd: 1450,
  flashEnd: 1550,
  fadeStart: 2080,
  end: 2200,
  lineInterval: 35,
  reducedMotionHold: 400,
} as const;

export const BOOT_TICK_MS = 35;

/** Number of segments of the progress bar. */
export const BOOT_PROGRESS_SEGMENTS = 29;

export type BootStage = 1 | 2 | 3 | 4;

/** Mobile frames: BOOT 01/04 at 0.00s, 02 at 0.40s, 03 at 1.20s, 04 at 1.90s. */
export function getBootStage(elapsed: number): BootStage {
  if (elapsed < BOOT_TIMELINE.cursorEnd) return 1;
  if (elapsed < 1000) return 2;
  if (elapsed < BOOT_TIMELINE.flashEnd) return 3;
  return 4;
}

export function isBootFlash(elapsed: number): boolean {
  return elapsed >= BOOT_TIMELINE.logEnd && elapsed < BOOT_TIMELINE.flashEnd;
}

/** How many log lines are due at `elapsed` (the first one lands at 200ms). */
export function getDueLineCount(elapsed: number, total: number): number {
  if (elapsed < BOOT_TIMELINE.cursorEnd) return 0;
  const due =
    Math.floor(
      (elapsed - BOOT_TIMELINE.cursorEnd) / BOOT_TIMELINE.lineInterval,
    ) + 1;
  return Math.min(total, due);
}

const PROGRESS_KEYFRAMES: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [400, 34],
  [1200, 87],
  [1550, 97],
  [1900, 100],
];

/** Progress percentage matching the Figma frames (0% / 34% / 87% / 100%). */
export function getBootProgress(elapsed: number): number {
  if (elapsed <= 0) return 0;
  for (let i = 1; i < PROGRESS_KEYFRAMES.length; i++) {
    const [t1, p1] = PROGRESS_KEYFRAMES[i];
    if (elapsed <= t1) {
      const [t0, p0] = PROGRESS_KEYFRAMES[i - 1];
      return Math.round(p0 + ((p1 - p0) * (elapsed - t0)) / (t1 - t0));
    }
  }
  return 100;
}

/**
 * Older lines fade in steps: the six newest stay solid, then each step drops
 * the opacity until it settles at 18% (Figma log, `5638:836`).
 */
export function getLineOpacity(age: number): number {
  if (age < 6) return 1;
  return Math.max(0.18, Math.round((1 - (age - 5) * 0.07) * 100) / 100);
}
