import type { CollectionEntry } from './CollectionEntry';
import type { Game } from './Game';
import type { Profile } from './Profile';
export type Review = {
    id: string;
    content: string | null;
    rating: number;
    game: Game;
    gameId: number;
    profile: Profile;
    profileUserId: string;
    collectionEntry: CollectionEntry;
    createdAt: string;
    updatedAt: string;
};
//# sourceMappingURL=Review.d.ts.map