import type { GameNodeBridge } from "../shared/bridge";
declare global {
  interface Window {
    gamenode: GameNodeBridge;
  }
}
