import { Switch } from "@mantine/core";
import { cn } from "#@/util";

interface Props {
  /** Accessible name; the switch has no visible label. */
  label: string;
  /** Shown state. The switch is always disabled: there is no API to save it. */
  checked?: boolean;
  className?: string;
}

/**
 * Read-only switch for settings that have no backend yet (or need Premium).
 * Keeps the Figma look (dark track, orange thumb when on) while disabled.
 */
export function SettingsLockedSwitch({
  label,
  checked = false,
  className,
}: Props) {
  return (
    <Switch
      size={"xs"}
      checked={checked}
      disabled
      readOnly
      aria-label={label}
      className={cn("opacity-60", className)}
      classNames={{
        track: "!bg-[#2a2a2a]",
        thumb: checked ? "!bg-[#f15025]" : "!bg-[#7a7a7a]",
      }}
    />
  );
}
