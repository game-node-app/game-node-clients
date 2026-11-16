import {
  displayStyle,
  RECAP_COLORS,
} from "#@/components/wrapped/card/recapCardTheme";
import {
  getPlatformIconName,
  getPlatformShortName,
} from "#@/components/wrapped/util/recapPlatform";
import { getServerStoredIcon } from "#@/util";

interface Props {
  name: string | null | undefined;
  /** Font size of the name, in card pixels. The icon follows it. */
  size: number;
  color?: string;
}

/** Platform icon followed by the platform name. */
export function RecapPlatformMark({
  name,
  size,
  color = RECAP_COLORS.cream,
}: Props) {
  const iconName = getPlatformIconName(name);
  const iconSize = Math.round(size * 1.15);

  return (
    <div
      className={"flex items-center"}
      style={{ gap: Math.round(size * 0.3) }}
    >
      {iconName && (
        <img
          src={getServerStoredIcon(iconName)}
          alt={""}
          className={"shrink-0 pointer-events-none"}
          style={{ width: iconSize, height: iconSize, objectFit: "contain" }}
        />
      )}
      <span
        className={"line-clamp-2 min-w-0"}
        style={displayStyle(size, color)}
      >
        {getPlatformShortName(name) ?? "-"}
      </span>
    </div>
  );
}
