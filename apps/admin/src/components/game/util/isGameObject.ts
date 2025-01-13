import { Game } from "@/wrapper/server";
import { TGameOrSearchGame } from "@/components/game/util/types";
import { schema_SearchGame } from "@/wrapper/search";

export function isGameSearchObject(
    game: TGameOrSearchGame,
): game is schema_SearchGame {
    if (!game) return false;
    return (game as schema_SearchGame).source === "manticore";
}

export function isGameObject(game: TGameOrSearchGame): game is Game {
    if (!game) return false;
    return (game as Game).source === Game.source.MYSQL;
}
