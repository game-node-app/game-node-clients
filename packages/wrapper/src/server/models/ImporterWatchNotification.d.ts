import type { GameExternalGame } from './GameExternalGame';
import type { Library } from './Library';
export type ImporterWatchNotification = {
    id: number;
    library: Library;
    libraryUserId: string;
    source: ImporterWatchNotification.source;
    games: Array<GameExternalGame> | null;
};
export declare namespace ImporterWatchNotification {
    enum source {
        STEAM = "steam",
        PSN = "psn"
    }
}
//# sourceMappingURL=ImporterWatchNotification.d.ts.map