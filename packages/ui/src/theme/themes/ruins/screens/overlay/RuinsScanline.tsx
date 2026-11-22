import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useRuinsPreferences } from "#@/theme/ruins/preferences";
import styles from "./RuinsScanline.module.css";

/**
 * Sweeps the viewport while any query or mutation is in flight. The motion is
 * hidden by CSS under `prefers-reduced-motion`.
 */
export function RuinsScanline() {
  const { scanline } = useRuinsPreferences();
  const activity = useIsFetching() + useIsMutating();
  if (!scanline || activity <= 0) return null;

  return (
    <div
      className={styles.scanline}
      aria-hidden="true"
      data-slot="ruins-scanline"
    />
  );
}
