import { Game } from "@/wrapper/server";
import status = Game.status;

export function getGameStatusText(statusNumber?: number) {
    if (!statusNumber) return undefined;
    const STATUS_TO_TEXT = {
        [status._0.valueOf()]: "Released",
        [status._2.valueOf()]: "Alpha",
        [status._3.valueOf()]: "Beta",
        [status._4.valueOf()]: "Early Access",
    };

    return STATUS_TO_TEXT[statusNumber];
}
