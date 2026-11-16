/**
 * Icon file (see `getServerStoredIcon`) for a platform name. The recap summary
 * only carries the platform name, so this mirrors the server's
 * `PlatformToIconMap` using the IGDB platform names.
 */
const PLATFORM_ICON_RULES: [RegExp, string][] = [
  [/playstation\s*5|\bps5\b/i, "ps5"],
  [/playstation\s*4|\bps4\b/i, "ps4"],
  [/playstation\s*3|\bps3\b/i, "ps3"],
  [/playstation\s*2|\bps2\b/i, "ps2"],
  [/playstation\s*portable|\bpsp\b/i, "psp"],
  [/vita/i, "psvita"],
  [/playstation/i, "playstation"],
  [/xbox\s*series/i, "xseriesx"],
  [/xbox\s*one/i, "xone"],
  [/xbox\s*360/i, "x360"],
  [/xbox/i, "xbox"],
  [/switch/i, "nswitch"],
  [/wii\s*u/i, "nwiiu"],
  [/wii/i, "nwii"],
  [/nintendo\s*64/i, "n64"],
  [/3ds|\bnds\b|nintendo\s*ds/i, "nds"],
  [/gamecube/i, "ngamecube"],
  [/windows|\bpc\b/i, "windows"],
  [/linux/i, "linux"],
  [/\bmac|os\s*x/i, "mac"],
  [/android/i, "android"],
  [/\bios\b|iphone|ipad/i, "apple"],
];

export function getPlatformIconName(
  name: string | null | undefined,
): string | undefined {
  if (!name) return undefined;
  return PLATFORM_ICON_RULES.find(([rule]) => rule.test(name))?.[1];
}

/**
 * Platform name short enough for the cards: "PC (Microsoft Windows)" becomes
 * "PC" and "PlayStation 5" becomes "PS5".
 */
export function getPlatformShortName(
  name: string | null | undefined,
): string | undefined {
  if (!name) return undefined;
  if (/windows|\bpc\b/i.test(name)) return "PC";

  const short = name
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/^playstation\s*(\d)/i, "PS$1")
    .trim();
  return short || name;
}
