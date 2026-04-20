import { CollectionEntry } from "@repo/wrapper/server";
import { match } from "ts-pattern";
import { useTranslation } from "@repo/locales";

export function getLocalizedCollectionEntryStatusName(
  status: CollectionEntry.status,
  t: ReturnType<typeof useTranslation>["t"],
): string {
  return match<CollectionEntry.status, string>(status)
    .with(CollectionEntry.status.PLAYING, () =>
      // @ts-expect-error --- IGNORE ---
      t("collectionEntry.statuses.playing"),
    )
    .with(CollectionEntry.status.FINISHED, () =>
      t("collectionEntry.statuses.finished"),
    )
    .with(CollectionEntry.status.DROPPED, () =>
      t("collectionEntry.statuses.dropped"),
    )
    .with(CollectionEntry.status.PLANNED, () =>
      t("collectionEntry.statuses.planned"),
    )
    .with(CollectionEntry.status.ONGOING, () =>
      t("collectionEntry.statuses.ongoing"),
    )
    .exhaustive();
}
