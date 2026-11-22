/* global process */

import { useEffect } from "react";
import { createContrastMonitor } from "./contrastMonitorCore";

/**
 * Development-only contrast monitor: logs and outlines text with low contrast
 * and solid dark blocks under a light theme. Renders nothing.
 *
 * Mount it behind a dev guard so it never reaches production bundles (the
 * apps do this with a dynamic import):
 *
 * ```tsx
 * // web (Next)
 * const ContrastMonitor =
 *   process.env.NODE_ENV !== "production"
 *     ? dynamic(() => import("@repo/ui/theme/dev/contrast-monitor"), { ssr: false })
 *     : null;
 * // mobile (Vite)
 * const ContrastMonitor = import.meta.env.DEV
 *   ? lazy(() => import("@repo/ui/theme/dev/contrast-monitor"))
 *   : null;
 * ```
 *
 * It is on by default when the active theme's color scheme differs from the
 * default theme's (Ruins vs GameNode). `localStorage.setItem("gn-contrast-monitor",
 * "on" | "off")` forces it. See `contrastMonitorCore.ts` for details.
 */
export function ContrastMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    const monitor = createContrastMonitor();
    void monitor.start();

    return () => monitor.stop();
  }, []);

  return null;
}

export default ContrastMonitor;
