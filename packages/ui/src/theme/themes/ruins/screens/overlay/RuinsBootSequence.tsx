import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@repo/locales";
import { useUserId } from "#@/components/auth/hooks/useUserId";
import { useEntrySplashDone } from "#@/context/UIProvider";
import {
  getLocalDateString,
  readLastBootDate,
  readRuinsPreferences,
  writeLastBootDate,
} from "#@/theme/ruins/preferences";
import {
  BOOT_LAST_TS,
  BOOT_LINE_DEFS,
  BOOT_VERSION,
  getCachedLevel,
  getCachedUsername,
  resolveBootLine,
  type BootContext,
  type BootTranslate,
  type BootLine,
  type BootPanelKey,
} from "./bootData";
import {
  BOOT_PROGRESS_SEGMENTS,
  BOOT_TICK_MS,
  BOOT_TIMELINE,
  getBootProgress,
  getBootStage,
  getDueLineCount,
  getLineOpacity,
  isBootFlash,
  type BootStage,
} from "./bootTimeline";
import styles from "./RuinsBootSequence.module.css";

/** The sequence runs at most once per JS app lifetime (cold start / first mount). */
let bootConsumed = false;

/** Test hook: lets a test mount the sequence again in the same module instance. */
export function resetRuinsBootSequenceForTests() {
  bootConsumed = false;
}

type BootRun = { mode: "full" | "reduced"; clock: string };

const PANEL_ORDER: BootPanelKey[] = [
  "library",
  "connections",
  "importer",
  "feats",
  "daily",
  "goal",
  "awards",
];

function cx(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

function formatClock(date: Date): string {
  const day = date
    .toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/\./g, "")
    .toUpperCase();
  return `${day} · ${date.toLocaleTimeString(undefined, { hour12: false })}`;
}

/**
 * Decides once whether the sequence runs (preference, daily cadence) and then
 * mounts it. Renders nothing on the server and on the first client render so
 * hydration never mismatches.
 *
 * When the app has its own launch splash (native mobile), the timeline waits
 * for it (`useEntrySplashDone`): until then only the boot's first frame (the
 * paper background) is rendered, so the splash hands off to the boot instead
 * of the boot playing hidden underneath it and app content flashing in
 * between. Web and admin have no such splash and start at once.
 */
export function RuinsBootSequence() {
  const [run, setRun] = useState<BootRun | null>(null);
  const decided = useRef(false);
  const splashDone = useEntrySplashDone();

  useEffect(() => {
    if (decided.current) return;
    decided.current = true;
    if (bootConsumed) return;
    bootConsumed = true;

    const { bootAnimation } = readRuinsPreferences();
    if (bootAnimation === "never") return;
    if (
      bootAnimation === "daily" &&
      readLastBootDate() === getLocalDateString()
    )
      return;

    writeLastBootDate();
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const next: BootRun = {
      mode: reduced ? "reduced" : "full",
      clock: formatClock(new Date()),
    };
    // Mount after the effect so the first client render matches the server.
    queueMicrotask(() => setRun(next));
  }, []);

  const handleDone = useCallback(() => setRun(null), []);

  if (!run) return null;
  if (!splashDone) {
    return (
      <div
        className={styles.root}
        data-slot="ruins-boot-waiting"
        aria-hidden="true"
      />
    );
  }
  return (
    <RuinsBootScreen mode={run.mode} clock={run.clock} onDone={handleDone} />
  );
}

type Frame = { elapsed: number; lines: BootLine[] };

const REDUCED_FRAME: Frame = { elapsed: 1700, lines: [] };

function RuinsBootScreen({
  mode,
  clock,
  onDone,
}: {
  mode: BootRun["mode"];
  clock: string;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const userId = useUserId();
  const { t } = useTranslation();
  const translate = useCallback<BootTranslate>(
    (key, options) => t(key as never, options as never) as unknown as string,
    [t],
  );
  const [frame, setFrame] = useState<Frame>(
    mode === "full" ? { elapsed: 0, lines: [] } : REDUCED_FRAME,
  );
  const [announcement, setAnnouncement] = useState("");

  // The log reads the cache as each line lands, so it needs the latest values.
  const live = useRef({ userId, translate });
  useEffect(() => {
    live.current = { userId, translate };
  });

  useEffect(() => {
    if (mode === "reduced") {
      const id = setTimeout(onDone, BOOT_TIMELINE.reducedMotionHold);
      return () => clearTimeout(id);
    }

    const start = Date.now();
    const lines: BootLine[] = [];
    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= BOOT_TIMELINE.end) {
        onDone();
        return;
      }
      const due = getDueLineCount(elapsed, BOOT_LINE_DEFS.length);
      while (lines.length < due) {
        const ctx: BootContext = {
          queryClient,
          userId: live.current.userId,
          t: live.current.translate,
          online:
            typeof navigator === "undefined" || navigator.onLine !== false,
        };
        lines.push(resolveBootLine(BOOT_LINE_DEFS[lines.length], ctx));
      }
      setFrame({ elapsed, lines: [...lines] });
    };
    const id = setInterval(tick, BOOT_TICK_MS);
    return () => clearInterval(id);
  }, [mode, queryClient, onDone]);

  // Tap, click, Esc or Enter skip at any time. Enter is swallowed so it does
  // not activate whatever has focus underneath.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" && event.key !== "Enter") return;
      event.preventDefault();
      event.stopPropagation();
      onDone();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onDone]);

  // A live region only announces content added after it is mounted.
  useEffect(() => {
    const id = setTimeout(() => setAnnouncement(t("ruins.boot.loaded")), 30);
    return () => clearTimeout(id);
  }, [t]);

  const { elapsed, lines } = frame;
  const stage = getBootStage(elapsed);
  const leaving = mode === "full" && elapsed >= BOOT_TIMELINE.fadeStart;
  const progress = mode === "full" ? getBootProgress(elapsed) : 100;
  // Pure cache reads (never fetches); they refresh with every frame.
  const ctx: BootContext = { queryClient, userId, t: translate, online: true };
  const unitName = getCachedUsername(ctx);

  return (
    <div
      className={cx(styles.root, leaving && styles.leaving)}
      data-slot="ruins-boot"
      data-stage={stage}
      onPointerDown={onDone}
      onClick={onDone}
    >
      <div role="status" className={styles.srOnly}>
        {announcement}
      </div>
      <div className={styles.screen} aria-hidden="true">
        <BootHeader stage={stage} clock={clock} />
        <div className={styles.body}>
          {stage === 1 && <BootSplash />}
          {(stage === 2 || stage === 3) && (
            <BootLog
              lines={lines}
              unitName={unitName}
              level={getCachedLevel(ctx)}
            />
          )}
          {stage === 4 && <BootLockup name={unitName} />}
        </div>
        <BootFooter stage={stage} progress={progress} />
        {isBootFlash(elapsed) && <div className={styles.flash} />}
      </div>
    </div>
  );
}

function BootHeader({ stage, clock }: { stage: BootStage; clock: string }) {
  const { t } = useTranslation();
  return (
    <header className={styles.header}>
      <span className={styles.marker} />
      <span className={styles.brand}>
        GN-OS
        <span className={styles.brandWeb}>
          {" "}
          {BOOT_VERSION} · {t("ruins.boot.sequence")}
        </span>
      </span>
      <span className={styles.metaWeb}>{clock}</span>
      <span className={styles.meta}>BOOT 0{stage}/04</span>
    </header>
  );
}

function BootSegments({ ratio, count }: { ratio: number; count: number }) {
  const filled = Math.floor(Math.max(0, Math.min(1, ratio)) * count);
  return (
    <div className={styles.bar}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cx(styles.seg, i < filled && styles.segOn)} />
      ))}
    </div>
  );
}

function BootSplash() {
  const { t } = useTranslation();
  return (
    <>
      <div className={styles.prompt}>
        <span>{">"}</span>
        <span className={cx(styles.cursor, styles.cursorLarge)} />
      </div>
      <div className={styles.splash}>
        <div className={styles.splashTitle}>GN-OS {BOOT_VERSION}</div>
        <div className={styles.splashLabel}>
          {t("ruins.boot.splash.waiting")}
        </div>
        <div className={styles.dots}>
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={cx(
                styles.dot,
                i < 5 && styles.dotOn,
                i === 5 && styles.dotHead,
              )}
            />
          ))}
        </div>
        <div className={styles.splashLabel}>
          {t("ruins.boot.splash.signal")}
        </div>
        <div className={styles.hex}>0x00A4 · 0x00B8 · 0x0130 · 0x01F2</div>
      </div>
    </>
  );
}

function BootLog({
  lines,
  unitName,
  level,
}: {
  lines: BootLine[];
  unitName: string | undefined;
  level: ReturnType<typeof getCachedLevel>;
}) {
  const { t } = useTranslation();
  const latest = lines.length - 1;
  const finished = lines.length === BOOT_LINE_DEFS.length;

  return (
    <div className={styles.columns}>
      <div className={styles.log} data-slot="ruins-boot-log">
        {lines.map((line, index) => {
          const active = index === latest;
          return (
            <div
              key={line.id}
              className={cx(styles.line, active && styles.lineActive)}
              style={{ opacity: active ? 1 : getLineOpacity(latest - index) }}
              data-line={line.id}
            >
              <span className={styles.ts}>{line.ts}</span>
              <span className={styles.label}>{line.label}</span>
              <span className={styles.leader} />
              {active ? (
                <span className={styles.cursor} />
              ) : line.status ? (
                <span
                  className={cx(
                    styles.status,
                    line.tone === "highlight" && styles.statusHighlight,
                  )}
                  data-status={line.pending ? "pending" : "value"}
                >
                  {line.status}
                </span>
              ) : null}
            </div>
          );
        })}
        {finished && (
          <div className={styles.summary}>
            <span>{t("ruins.boot.summary.done")}</span>
            <span>{t("ruins.boot.summary.time", { time: BOOT_LAST_TS })}</span>
            <span>{t("ruins.boot.summary.cache")}</span>
          </div>
        )}
      </div>
      <BootPanel lines={lines} unitName={unitName} level={level} />
    </div>
  );
}

/** "System check" panel, shown on wide screens only (web frame 5639:716). */
function BootPanel({
  lines,
  unitName,
  level,
}: {
  lines: BootLine[];
  unitName: string | undefined;
  level: ReturnType<typeof getCachedLevel>;
}) {
  const { t } = useTranslation();
  const labels: Record<BootPanelKey, string> = {
    library: t("ruins.boot.panel.library"),
    connections: t("ruins.boot.panel.connections"),
    importer: t("ruins.boot.panel.importer"),
    feats: t("ruins.boot.panel.feats"),
    daily: t("ruins.boot.panel.daily"),
    goal: t("ruins.boot.panel.goal"),
    awards: t("ruins.boot.panel.awards"),
  };
  const rows = PANEL_ORDER.map((key) =>
    lines.find((line) => line.panel === key),
  ).filter((line): line is BootLine => line !== undefined);

  return (
    <div className={cx(styles.panel, styles.panelBox)}>
      <div className={styles.panelTitle}>
        <span className={styles.marker} />
        <span>{t("ruins.boot.panel.title")}</span>
        <span>
          {rows.length}/{PANEL_ORDER.length}
        </span>
      </div>
      <div className={styles.panelRows}>
        {rows.map((line) => (
          <div key={line.id} className={styles.panelRow}>
            <span className={styles.panelRowLabel}>
              {labels[line.panel as BootPanelKey]}
            </span>
            <BootSegments ratio={line.ratio} count={14} />
            <span
              className={cx(
                styles.panelRowValue,
                line.tone === "highlight" && styles.statusHighlight,
              )}
            >
              {line.status}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.unit}>
        <span className={styles.unitLabel}>
          {t("ruins.boot.panel.unit")} · {unitName ?? t("ruins.boot.pending")}
        </span>
        {level ? (
          <>
            <span className={styles.unitLevel}>
              {t("ruins.boot.panel.level", { level: level.currentLevel })}
              <span className={styles.unitXp}>
                {level.currentLevelExp.toLocaleString()} /{" "}
                {level.levelUpExpCost.toLocaleString()} XP
              </span>
            </span>
            <BootSegments
              ratio={
                level.levelUpExpCost > 0
                  ? level.currentLevelExp / level.levelUpExpCost
                  : 1
              }
              count={20}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}

function BootLockup({ name }: { name: string | undefined }) {
  const { t } = useTranslation();
  return (
    <div className={styles.lockupWrap}>
      <div className={styles.lockup} data-slot="ruins-boot-lockup">
        <span className={cx(styles.corner, styles.cornerTl)} />
        <span className={cx(styles.corner, styles.cornerTr)} />
        <span className={cx(styles.corner, styles.cornerBl)} />
        <span className={cx(styles.corner, styles.cornerBr)} />
        <span className={styles.lockupKicker}>
          {t("ruins.boot.lockup.systems")}
        </span>
        <p className={styles.lockupTitle}>GameNode</p>
        <div className={styles.lockupOk}>
          <span className={styles.lockupRule} />
          <span className={styles.lockupBadge}>OK</span>
          <span className={styles.lockupRule} />
        </div>
        {name ? (
          <span className={styles.lockupWelcome}>
            {t("ruins.boot.lockup.welcome", { name })}
          </span>
        ) : null}
      </div>
      <div className={styles.hint}>
        <span className={styles.hintMarker} />
        <span>{t("ruins.boot.hint.tap")}</span>
      </div>
    </div>
  );
}

function BootFooter({
  stage,
  progress,
}: {
  stage: BootStage;
  progress: number;
}) {
  const { t } = useTranslation();
  const label =
    stage === 1
      ? t("ruins.boot.stage.initializing")
      : stage === 2
        ? t("ruins.boot.stage.modules")
        : stage === 3
          ? t("ruins.boot.stage.assembling")
          : t("ruins.boot.stage.ready");
  const filled = Math.floor((progress * BOOT_PROGRESS_SEGMENTS) / 100);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerLabel}>
        <span className={styles.footerStage}>{label}</span>
        <span className={styles.keys}>
          <span className={styles.key}>
            <span className={styles.keycap}>ESC</span>
            {t("ruins.boot.hint.skip")}
          </span>
          <span className={styles.key}>
            <span className={styles.keycap}>ENTER</span>
            {t("ruins.boot.hint.continue")}
          </span>
        </span>
        <span className={styles.footerPercent}>{progress}%</span>
      </div>
      <div className={styles.bar} data-slot="ruins-boot-progress">
        {Array.from({ length: BOOT_PROGRESS_SEGMENTS }, (_, i) => (
          <span
            key={i}
            className={cx(
              styles.seg,
              i < filled - 1 && styles.segOn,
              filled > 0 && i === filled - 1 && styles.segHead,
            )}
          />
        ))}
      </div>
    </footer>
  );
}
