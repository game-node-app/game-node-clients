import {
  GameAchievementGroupDto,
  GameExternalGame,
  GameExternalStoreDto,
} from "@repo/wrapper/server";
import { P } from "ts-pattern";
import { Chainable } from "ts-pattern/types";

/**
 * Checks is an string is a valid Xbox productId.
 * @example
 * +------------+
 * |uid         |
 * +------------+
 * |BZLN1W2ML7MG|
 * |BZJH18QJVDVW|
 * |BS8M9DCFB5BJ|
 * +------------+
 * @param productId
 */
const isValidXboxProductId = (productId: string) => {
  const match = productId.match(/^[A-Z0-9]{12}$/);
  console.log("match", match);
  return match != undefined && match.length > 0;
};

export const XBOX_STORES = [
  // Microsoft
  GameAchievementGroupDto.source._11,
  // Xbox Marketplace
  GameAchievementGroupDto.source._31,
  // Xbox Gamepass
  GameAchievementGroupDto.source._54,
] as const;

export const ACHIEVEMENT_ENABLED_STORES = [
  GameAchievementGroupDto.source._1,
  GameAchievementGroupDto.source._36,
  ...XBOX_STORES,
];

export function getAchievementsEnabledStores(stores: GameExternalStoreDto[]) {
  console.log("stores", stores);
  return stores.filter((store) => {
    if (ACHIEVEMENT_ENABLED_STORES.includes(store.category as never)) {
      // Xbox
      if (XBOX_STORES.includes(store.category as never)) {
        console.log("Store: ", store);
        console.log("isValid: ", isValidXboxProductId(store.uid));
        return isValidXboxProductId(store.uid);
      }

      return true;
    }

    return false;
  });
}
