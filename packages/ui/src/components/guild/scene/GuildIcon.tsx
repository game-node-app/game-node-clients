import { cn } from "#@/util";

import styles from "../guild.module.css";

import { GUILD_ASSETS, type GuildAssetName } from "./assets";

export interface GuildIconProps {
  name: GuildAssetName;
  /** Width in px; the height follows the artwork's ratio. Defaults to intrinsic. */
  size?: number;
  className?: string;
  /** Decorative by default; pass "Lina" for the receptionist. */
  alt?: string;
}

/**
 * Renders one Guild SVG from `GUILD_ASSETS` on the pixel grid, always with an
 * explicit width/height so nothing reflows while the artwork loads.
 */
export function GuildIcon({ name, size, className, alt = "" }: GuildIconProps) {
  const asset = GUILD_ASSETS[name];
  const width = size ?? asset.width;
  const height = size
    ? Math.max(1, Math.round((size * asset.height) / asset.width))
    : asset.height;

  return (
    <img
      src={asset.src}
      width={width}
      height={height}
      alt={alt}
      draggable={false}
      className={cn(styles.pixelated, className)}
      style={{ imageRendering: "pixelated" }}
    />
  );
}
