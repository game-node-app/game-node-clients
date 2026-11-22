// Side-effect anchor for the Ruins screen-pack CSS. `apps/web` imports this file
// through `next/dynamic`, so Next includes the pack's CSS Modules in SSR when
// the Ruins theme is active, and never for the other themes. The hidden element
// keeps the dynamic module (and its CSS) reachable to the bundler; the anchor
// class is the pack stylesheet's only local export, and without it Vite dropped
// the side-effect-only CSS Module from production builds.
import {
  PRIMITIVES_ANCHOR_CLASS,
  presenters,
} from "../../themes/ruins/screens";

export default function RuinsScreenPackStyles() {
  return (
    <span
      hidden
      aria-hidden
      data-theme-pack="ruins-screens"
      data-theme-pack-presenters={Object.keys(presenters).length}
      className={PRIMITIVES_ANCHOR_CLASS}
    />
  );
}
