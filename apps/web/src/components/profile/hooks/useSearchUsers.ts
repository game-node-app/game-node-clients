import { useQuery } from "@tanstack/react-query";
import {
    type schema_UserSearchRequestDto,
    SearchService,
} from "@/wrapper/search";

export function useSearchUsers(searchParameters: schema_UserSearchRequestDto) {
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
            searchParameters != undefined &&
            searchParameters.query != undefined &&
            searchParameters.query.length > 2,
    });
}
