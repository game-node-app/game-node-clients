import { Game } from "../../../../../wrapper/src/server";
import type { LibraryVisibilityLevel } from "#@/components/collection/collection-entry/visibility/LibraryVisibilityLevel";
import { SearchGame } from "#@/components/game/search/utils/types";

export type TGameOrSearchGame = {
  /**
   * Custom href used by {@link GameFigureImage}.
   */
  href?: string;
  /**
   * Visibility of the viewer's own collection entry for this game.
   *
   * Set only by listings of the viewer's own library; {@link GameFigureImage}
   * uses it for the owner-only visibility badge.
   */
  visibility?: LibraryVisibilityLevel;
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
