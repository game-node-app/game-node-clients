import { push } from "@socialgouv/matomo-next";

export enum EMatomoEventCategory {
    Collection = "Collection",
    CollectionEntry = "Collection Entry",
    Review = "Review",
    Activity = "Activity",
    Comment = "Comment",
    Importer = "Importer",
    Favorites = "Favorites",
}

export enum EMatomoEventAction {
    Create = "Create",
    Update = "Update",
    Remove = "Remove",
    Like = "Like",
    Comment = "Comment",
    Share = "Share",
}

export function trackMatomoEvent(
    category: EMatomoEventCategory,
    action: EMatomoEventAction,
    name: string,
    value?: number,
) {
    push(["trackEvent", category, action, name, value]);
}
