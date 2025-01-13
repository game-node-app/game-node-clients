import { TGameOrSearchGame } from "@/components/game/util/types";
import {
    isGameObject,
    isGameSearchObject,
} from "@/components/game/util/isGameObject";

export function getCoverUrl(game: TGameOrSearchGame | undefined) {
    if (!game) return undefined;
    if (isGameSearchObject(game) && game.coverUrl) {
        return game.coverUrl;
    } else if (isGameObject(game) && game.cover) {
        return game.cover.url;
    }
    return undefined;
}
