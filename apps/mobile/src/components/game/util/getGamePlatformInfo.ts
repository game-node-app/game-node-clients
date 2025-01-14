import { TGameOrSearchGame } from "@/components/game/util/types";
import {
    isGameObject,
    isGameSearchObject,
} from "@/components/game/util/isGameObject";

export interface IGamePlatformInfo {
    platformsIds: number[] | undefined;
    platformsNames: string[] | undefined;
    platformsAbbreviations: string[] | undefined;
}

export function getGamePlatformInfo(
    game: TGameOrSearchGame | undefined,
): IGamePlatformInfo {
    const platformInfo: IGamePlatformInfo = {
        platformsIds: undefined,
        platformsNames: undefined,
        platformsAbbreviations: undefined,
    };

    if (game && isGameSearchObject(game)) {
        if (game.platformsNames) {
            platformInfo.platformsNames = game.platformsNames.split(", ");
        }
        if (game.platformsAbbreviations) {
            platformInfo.platformsAbbreviations =
                game.platformsAbbreviations.split(", ");
        }
    } else if (game && isGameObject(game)) {
        if (game.platforms) {
            platformInfo.platformsIds = game.platforms.map(
                (platform) => platform.id,
            );
            platformInfo.platformsNames = game.platforms.map(
                (platform) => platform.name,
            );
            platformInfo.platformsAbbreviations = game.platforms.map(
                (platform) => platform.abbreviation,
            );
        }
    }

    return platformInfo;
}
