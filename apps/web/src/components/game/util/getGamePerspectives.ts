import { TGameOrSearchGame } from "@/components/game/util/types";
import {
    isGameObject,
    isGameSearchObject,
} from "@/components/game/util/isGameObject";

export function getGamePerspectives(game: TGameOrSearchGame) {
    if (isGameSearchObject(game)) {
        return undefined;
    } else if (isGameObject(game)) {
        return game.playerPerspectives;
    }
    return undefined;
}
