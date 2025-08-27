import { EGameCategory } from "#@/components";
import { games_GameSearchRequestDto } from "@repo/wrapper/search";

export type GameSearchRequestBuilderValues = {
  query: string;
  includeDlcs: boolean;
  includeExtraContent: boolean;
};

export function buildGameCategoryFilters({
  includeExtraContent,
  includeDlcs,
}: Omit<GameSearchRequestBuilderValues, "query">): Array<EGameCategory> {
  const categories: games_GameSearchRequestDto["category"] = [
    EGameCategory.Main,
    EGameCategory.Remaster,
    EGameCategory.Remake,
  ];

  if (includeDlcs) {
    categories.push(
      ...[
        EGameCategory.DlcAddon,
        EGameCategory.Expansion,
        EGameCategory.StandaloneExpansion,
      ],
    );
  }

  if (includeExtraContent) {
    categories.push(
      ...[
        EGameCategory.Bundle,
        EGameCategory.ExpandedGame,
        EGameCategory.Episode,
        EGameCategory.Season,
        EGameCategory.Mod,
        EGameCategory.Port,
        EGameCategory.Fork,
        EGameCategory.Pack,
        EGameCategory.Update,
      ],
    );
  }

  return categories;
}

export function buildGameSearchRequestDto(
  data: GameSearchRequestBuilderValues,
): Pick<games_GameSearchRequestDto, "query" | "category"> {
  return {
    query: data.query,
    category: buildGameCategoryFilters(data),
  };
}
