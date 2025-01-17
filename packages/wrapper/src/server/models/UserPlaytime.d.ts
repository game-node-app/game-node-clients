import type { Game } from './Game';
import type { GameExternalGame } from './GameExternalGame';
import type { Profile } from './Profile';
export type UserPlaytime = {
    lastPlayedDate: string | null;
    firstPlayedDate: string | null;
    id: number;
    source: UserPlaytime.source;
    profile: Profile;
    profileUserId: string;
    game: Game;
    gameId: number;
    /**
     * Since a user can have a single game in more than one source, this helps us identify
     * where it has been imported from.
     */
    externalGame: GameExternalGame;
    externalGameId: number;
    /**
     * Total playtime for this game, in seconds.
     */
    totalPlaytimeSeconds: number;
    /**
     * Recent playtime in seconds.
     * 'Recent' definition varies between sources.
     * For Steam, it's the last two weeks,
     * for PSN, it's not available :p
     */
    recentPlaytimeSeconds: number;
    /**
     * Total number of times this game has been played.
     * Not available in Steam.
     */
    totalPlayCount: number;
    createdAt: string;
    updatedAt: string;
};
export declare namespace UserPlaytime {
    enum source {
        STEAM = "steam",
        PSN = "psn"
    }
}
//# sourceMappingURL=UserPlaytime.d.ts.map