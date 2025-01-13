import {
    GameSearchRequestDto,
    GameSearchResponseDto,
} from "@/components/game/search/utils/types";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    ApiError,
    schema_GameSearchRequestDto,
    SearchService,
} from "@repo/wrapper/search";

const parseDto = (dto: GameSearchRequestDto) => {
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

export default function useSearchGames(
    searchParameters: GameSearchRequestDto,
    enabled: boolean = true,
) {
    return useQuery<GameSearchResponseDto, ApiError>({
        queryKey: ["game", "search", searchParameters],
        queryFn: async () => {
            return SearchService.postSearchGames(parseDto(searchParameters));
        },
        placeholderData: keepPreviousData,
        enabled: enabled,
    });
}
