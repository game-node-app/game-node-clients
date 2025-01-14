import { TGameOrSearchGame } from "@/components/game/util/types";
import {
    isGameObject,
    isGameSearchObject,
} from "@/components/game/util/isGameObject";

export function getGameThemes(game: TGameOrSearchGame): string[] | undefined {
    if (isGameSearchObject(game)) {
        return game.themesNames?.split(", ");
    } else if (isGameObject(game)) {
        return game.themes
            ?.map((theme) => theme.name!)
            .filter((v) => v != undefined);
    }

    return undefined;
}
