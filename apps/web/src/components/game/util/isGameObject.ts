import { Game } from "@/wrapper/server";
import { TGameOrSearchGame } from "@/components/game/util/types";
import { SearchGame } from "@/components/game/search/utils/types";

export function isGameSearchObject(
    game: TGameOrSearchGame,
): game is SearchGame {
    if (!game) return false;
    return (game as SearchGame).source === "manticore";
}

export function isGameObject(game: TGameOrSearchGame): game is Game {
    if (!game) return false;
    return (game as Game).source === Game.source.MYSQL;
}
