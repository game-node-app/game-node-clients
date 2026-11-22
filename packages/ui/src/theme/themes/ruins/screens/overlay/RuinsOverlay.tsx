import styles from "../RuinsPrimitives.module.css";
import { RuinsBootSequence } from "./RuinsBootSequence";
import { RuinsPaperTexture } from "./RuinsPaperTexture";
import { RuinsScanline } from "./RuinsScanline";

/**
 * Atmosphere layers of the Ruins theme, rendered once at the app root by
 * `ThemeOverlayHost`: paper texture, loading scanline and the boot sequence.
 *
 * The hidden anchor keeps `RuinsPrimitives.module.css` in the bundle graph: the
 * stylesheet has no visual element of its own, and a side-effect-only CSS
 * Module was tree-shaken out of production builds.
 */
export function RuinsOverlay() {
  return (
    <>
      <span
        aria-hidden
        hidden
        data-slot="ruins-primitives-anchor"
        className={styles.primitivesAnchor}
      />
      <RuinsPaperTexture />
      <RuinsScanline />
      <RuinsBootSequence />
    </>
  );
}
