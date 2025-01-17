import type { CollectionEntry } from './CollectionEntry';
import type { Library } from './Library';
export type Collection = {
    id: string;
    name: string;
    description: string;
    isPublic: boolean;
    library: Library;
    libraryUserId: string;
    entries: Array<CollectionEntry>;
    isFeatured: boolean;
    isFinished: boolean;
    createdAt: string;
    updatedAt: string;
};
//# sourceMappingURL=Collection.d.ts.map