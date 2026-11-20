// Side-effect anchor for the console experience CSS. `apps/web` imports this
// file through `next/dynamic`, so Next includes the pack's CSS Modules in SSR
// when the console experience is active, and never for the default experience.
// The provider's own `import()` shares the same module instance. The hidden
// element keeps the dynamic module (and its CSS) reachable to the bundler.
import { presenters } from "../../experiences/console";

export default function ConsolePackStyles() {
  return (
    <span
      hidden
      aria-hidden
      data-theme-pack="console"
      data-theme-pack-presenters={Object.keys(presenters).length}
    />
  );
}
