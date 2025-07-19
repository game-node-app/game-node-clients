import { CollectionEntry } from "@repo/wrapper/server";
import { match } from "ts-pattern";

export function getCollectionEntryStatusName(status: CollectionEntry.status) {
  return match(status)
    .with(CollectionEntry.status.PLAYING, () => "Playing")
    .with(CollectionEntry.status.FINISHED, () => "Finished")
    .with(CollectionEntry.status.DROPPED, () => "Dropped")
    .with(CollectionEntry.status.PLANNED, () => "Planned")
    .exhaustive();
}
