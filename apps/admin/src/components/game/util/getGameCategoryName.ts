import { Game } from "@/wrapper/server";

/**
 * Based on a game's category id, retrieves its readable name.
 * @param category
 */
export function getGameCategoryName(category?: number) {
    const CATEGORY_TO_TEXT = {
        [Game.category._1.valueOf()]: "DLC",
        [Game.category._2.valueOf()]: "DLC",
        [Game.category._3.valueOf()]: "Bundle",
        [Game.category._4.valueOf()]: "Expansion",
        [Game.category._5.valueOf()]: "Mod",
        [Game.category._6.valueOf()]: "Episode",
        [Game.category._7.valueOf()]: "Season",
        [Game.category._8.valueOf()]: "Remake",
        [Game.category._9.valueOf()]: "Remaster",
        [Game.category._10.valueOf()]: "Expanded Game",
        [Game.category._11.valueOf()]: "Port",
        [Game.category._12.valueOf()]: "Fork",
        [Game.category._13.valueOf()]: "Pack",
        [Game.category._14.valueOf()]: "Update",
    };
    if (!category) return undefined;
    return CATEGORY_TO_TEXT[category];
}
