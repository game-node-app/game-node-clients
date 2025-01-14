import { GameSearchRequestDto, GameSearchResponseDto } from "@/components/game/search/utils/types";
import { keepPreviousData, useQuery, UseQueryResult } from "@tanstack/react-query";
import { schema_GameSearchRequestDto, SearchService } from "@/wrapper/search";

export const parseSearchGamesDto = (dto: GameSearchRequestDto) => {
    const parsedDto: schema_GameSearchRequestDto = {
        page: 1,
        limit: 20,
        ...dto,
    };
    if (typeof dto.page === "string") {
        parsedDto.page = parseInt(dto.page, 10);
    }
    if (typeof dto.limit === "string") {
        parsedDto.limit = parseInt(dto.limit, 10);
    }

    return parsedDto;
};

export default function useSearchGames(searchParameters: GameSearchRequestDto, enabled: boolean = true) {
    return useQuery<GameSearchResponseDto>({
        queryKey: ["game", "search", searchParameters],
        queryFn: async () => {
            return SearchService.postSearchGames(parseSearchGamesDto(searchParameters));
        },
        placeholderData: keepPreviousData,
        enabled: enabled,
    });
}
