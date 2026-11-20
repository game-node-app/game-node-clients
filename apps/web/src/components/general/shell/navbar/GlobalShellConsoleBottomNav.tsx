import { GlobalShellConsoleNav } from "@/components/general/shell/navbar/GlobalShellConsoleNav";
import styles from "./GlobalShellConsoleBottomNav.module.css";

/**
 * Fixed navigation bar below `md` in the console experience. It sits above the
 * page content with safe-area padding; GlobalAppShell reserves the same height
 * at the end of the page so the footer stays reachable.
 */
export default function GlobalShellConsoleBottomNav() {
  return (
    <div className={styles.root} data-console-bottom-nav="">
      <GlobalShellConsoleNav variant="bottom" />
    </div>
  );
}
