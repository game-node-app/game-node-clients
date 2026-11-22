import { useRuinsPreferences } from "#@/theme/ruins/preferences";
import styles from "./RuinsPaperTexture.module.css";

/** Fixed, non-interactive paper grain and grid; off when the option is off. */
export function RuinsPaperTexture() {
  const { paperTexture } = useRuinsPreferences();
  if (!paperTexture) return null;

  return (
    <div
      className={styles.texture}
      aria-hidden="true"
      data-slot="ruins-paper-texture"
    >
      <div className={styles.grid} />
      <div className={styles.grain} />
    </div>
  );
}
