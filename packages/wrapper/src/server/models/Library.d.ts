import type { Collection } from './Collection';
export type Library = {
    /**
     * @description The primary key of the library entity.
     * Also used to share the library with other users.
     *
     * Same as SuperTokens' userId.
     */
    userId: string;
    collections: Array<Collection>;
    createdAt: string;
    updatedAt: string;
};
//# sourceMappingURL=Library.d.ts.map