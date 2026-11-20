// Side-effect anchor for the Xbox screen-pack CSS. `apps/web` imports this file
// through `next/dynamic`, so Next includes the pack's CSS Modules in SSR when
// the Xbox theme is active, and never for the default theme. The hidden element
// keeps the dynamic module (and its CSS) reachable to the bundler.
import { presenters } from "../../themes/xbox/screens";

export default function XboxScreenPackStyles() {
  return (
    <span
      hidden
      aria-hidden
      data-theme-pack="xbox-screens"
      data-theme-pack-presenters={Object.keys(presenters).length}
    />
  );
}
