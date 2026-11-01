import { EGameExternalGameCategory } from "@/components/external_game/constants";

export function getExternalLookupUrl(item: {
  category: number;
  sourceUid: string;
}): string | undefined {
  switch (item.category as EGameExternalGameCategory) {
    case EGameExternalGameCategory.Steam:
      return `https://steamdb.info/app/${item.sourceUid}`;
    case EGameExternalGameCategory.EpicGamesNamespace:
      // An Epic namespace is a sandbox ID on egdata.
      return `https://egdata.app/sandboxes/${item.sourceUid}`;
    default:
      return undefined;
  }
}
