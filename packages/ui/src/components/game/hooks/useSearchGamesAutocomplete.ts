import { useQuery } from "@tanstack/react-query";
import { SearchService } from "@repo/wrapper/search";

export function useSearchGamesAutocomplete(query: string) {
  return useQuery({
    queryKey: ["game", "search", "autocomplete", query],
    queryFn: async () => {
      try {
        const results = await SearchService.postSearchGamesAutocomplete({
          query,
        });

        if (results && results.data) {
          return results.data;
        }
      } catch (err) {
        console.error(err);
      }

      return [];
    },
    enabled: query != undefined && query.length >= 3,
  });
}
