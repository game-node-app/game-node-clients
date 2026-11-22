import type { TFunction } from "i18next";
import type { GuildLicenseDto } from "@repo/wrapper/server";

type Translate = (key: string) => string;

/**
 * The name shown in the header and the License card: the equipped Guild title,
 * falling back to the rank title. Unknown cosmetic keys also fall back instead
 * of rendering the raw key.
 */
export function getGuildTitleLabel(
  license: Pick<GuildLicenseDto, "rank" | "equippedTitleKey">,
  t: TFunction,
): string {
  const translate = t as unknown as Translate;
  const rankTitle = translate(`guild.rank.${license.rank}`);

  if (!license.equippedTitleKey) return rankTitle;

  const key = `guild.rewards.${license.equippedTitleKey}`;
  const equipped = translate(key);
  return equipped === key ? rankTitle : equipped;
}
