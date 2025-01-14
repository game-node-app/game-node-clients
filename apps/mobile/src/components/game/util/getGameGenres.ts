import { GameGenre } from "@/wrapper/server";
import { isGameSearchObject } from "@/components/game/util/isGameObject";
import { TGameOrSearchGame } from "@/components/game/util/types";

/**
 * TODO: Add localizations to genre names.
 * @param game
 */
export function getGameGenres(game: TGameOrSearchGame): string[] | undefined {
    if (isGameSearchObject(game) && game.genresNames) {
        return game.genresNames.split(", ");
    } else if (!isGameSearchObject(game) && game.genres) {
        return game.genres
            .map((genre: GameGenre) => genre.name!)
            .filter((v) => v != undefined);
    }

    return undefined;
}
