import { useQuery } from "@tanstack/react-query";
import {
  type users_UserSearchRequestDto,
  SearchService,
} from "@repo/wrapper/search";

export function useSearchUsers(
  searchParameters: users_UserSearchRequestDto,
  enabled = true,
) {
  return useQuery({
    queryKey: ["user", "search", searchParameters],
    queryFn: () => {
      return SearchService.postSearchUsers({
        page: 1,
        limit: 10,
        ...searchParameters,
      });
    },
    enabled:
      enabled &&
      searchParameters != undefined &&
      searchParameters.query != undefined &&
      searchParameters.query.length > 2,
  });
}
