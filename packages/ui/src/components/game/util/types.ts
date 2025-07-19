import { Game } from "../../../../../wrapper/src/server";
import { SearchGame } from "#@/components/game/search/utils/types";

export type TGameOrSearchGame = {
  /**
   * Custom href used by {@link GameFigureImage}.
   */
  href?: string;
} & (Game | SearchGame);

export interface GameResourceFilter {
  /**
   * Resource name to be used in input labels
   */
  label: string;
  /**
   * Resource name to be used in the request endpoint
   */
  resource: string;
}

/**
 * See: https://api-docs.igdb.com/#game-enums
 */
export enum EGameCategory {
  Main,
  DlcAddon,
  Expansion,
  Bundle,
  StandaloneExpansion,
  Mod,
  Episode,
  Season,
  Remake,
  Remaster,
  ExpandedGame,
  Port,
  Fork,
  Pack,
  Update,
}
