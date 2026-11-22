import { RuinsBootSequence } from "./RuinsBootSequence";
import { RuinsPaperTexture } from "./RuinsPaperTexture";
import { RuinsScanline } from "./RuinsScanline";

/**
 * Atmosphere layers of the Ruins theme, rendered once at the app root by
 * `ThemeOverlayHost`: paper texture, loading scanline and the boot sequence.
 */
export function RuinsOverlay() {
  return (
    <>
      <RuinsPaperTexture />
      <RuinsScanline />
      <RuinsBootSequence />
    </>
  );
}
