import { EGameCategory, GameSearchFormValues } from "#@/components";
import { games_GameSearchRequestDto } from "@repo/wrapper/search";

export function buildGameSearchRequestDto(
  data: GameSearchFormValues,
): Pick<games_GameSearchRequestDto, "query" | "category"> {
  const categories: games_GameSearchRequestDto["category"] = [
    EGameCategory.Main,
    EGameCategory.Remaster,
    EGameCategory.Remake,
  ];

  if (data.includeDlcs) {
    categories.push(
      ...[
        EGameCategory.DlcAddon,
        EGameCategory.Expansion,
        EGameCategory.StandaloneExpansion,
      ],
    );
  }

  if (data.includeExtraContent) {
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

  return {
    query: data.query,
    category: categories,
  };
}
