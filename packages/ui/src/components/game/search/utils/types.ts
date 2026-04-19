import {
  games_GameSearchRequestDto,
  games_GameSearchResponseDto,
  games_SearchGame,
} from "@repo/wrapper/search";

export type SearchGame = games_SearchGame & { id: number };
export type GameSearchRequestDto = games_GameSearchRequestDto;
export type GameSearchResponseDto = games_GameSearchResponseDto;
