import { useQuery } from "@tanstack/react-query";
import { GameRepositoryService } from "../../../../../wrapper/src/server";

// @see game-node-server
export enum EGameExternalGameCategory {
  Steam = 1,
  Gog = 5,
  Youtube = 10,
  Microsoft = 11,
  Apple = 13,
  Twitch = 14,
  Android = 15,
  AmazonAsin = 20,
  AmazonLuna = 22,
  AmazonAdg = 23,
  EpicGamesStore = 26,
  Oculus = 28,
  Utomik = 29,
  ItchIo = 30,
  XboxMarketplace = 31,
  Kartridge = 32,
  PlaystationStoreUs = 36,
  FocusEntertainment = 37,
  XboxGamePassUltimateCloud = 54,
  Gamejolt = 55,
}

export function useGameExternalStores(gameId: number) {
  return useQuery({
    queryKey: ["game", "external-stores", gameId],
    queryFn: async () => {
      return GameRepositoryService.gameRepositoryControllerGetExternalStoresForGameIdV1(
        gameId,
      );
    },
    retry: 1,
    staleTime: Infinity,
  });
}
