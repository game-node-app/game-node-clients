import { Box, Radio, Text } from "@mantine/core";
import { ReactNode } from "react";
import { SettingsComingSoonBadge } from "#@/components/settings/common/SettingsPill";
import { cn } from "#@/util";

/** Colors of the mini app mock drawn in a theme card. */
export interface SettingsThemePalette {
  background: string;
  sidebar: string;
  title: string;
  text: string;
  accent: string;
  /** Adds a subtle border, for light backgrounds. */
  bordered?: boolean;
}

/** 18px radio dot from the Figma ("Radio (on)" / "Radio (off)"). */
export function SettingsRadioDot({ checked }: { checked: boolean }) {
  return (
    <Box
      component={"span"}
      aria-hidden
      className={cn(
        "block size-[18px] shrink-0 rounded-full border-solid transition-[border-width,border-color]",
        checked
          ? "border-[5px] border-[#f15025] bg-white"
          : "border-[1.5px] border-[#7a7a7a]",
      )}
    />
  );
}

/** Mini mock of the app (sidebar, title, text and a button) in the theme colors. */
function ThemePreview({ palette }: { palette: SettingsThemePalette }) {
  return (
    <Box
      component={"span"}
      className={cn(
        "flex h-[72px] w-full gap-1.5 overflow-hidden rounded-md pl-2 pt-2",
        palette.bordered && "border border-solid border-[#2a2a2a]",
      )}
      style={{ backgroundColor: palette.background }}
    >
      <Box
        component={"span"}
        className={"block h-14 w-[18px] shrink-0 rounded-[3px]"}
        style={{ backgroundColor: palette.sidebar }}
      />
      <Box
        component={"span"}
        className={"flex min-w-0 flex-1 flex-col gap-[5px]"}
      >
        <Box
          component={"span"}
          className={"block h-2 w-[60px] rounded-[2px]"}
          style={{ backgroundColor: palette.title }}
        />
        <Box
          component={"span"}
          className={"block h-1.5 w-10 rounded-[2px]"}
          style={{ backgroundColor: palette.text }}
        />
        <Box
          component={"span"}
          className={"block h-3 w-7 rounded-[3px]"}
          style={{ backgroundColor: palette.accent }}
        />
      </Box>
    </Box>
  );
}

interface Props {
  /** Radio value inside the surrounding `Radio.Group`. */
  value: string;
  label: ReactNode;
  description?: ReactNode;
  palette: SettingsThemePalette;
  checked: boolean;
  disabled?: boolean;
  /** Shows a "Coming soon" badge over the preview. Defaults to `disabled`. */
  withComingSoonBadge?: boolean;
}

/** Selectable theme card with a drawn preview (Figma "Tema" / "Settings / Tema especial"). */
export function SettingsThemeOptionCard({
  value,
  label,
  description,
  palette,
  checked,
  disabled = false,
  withComingSoonBadge = disabled,
}: Props) {
  return (
    <Radio.Card
      value={value}
      disabled={disabled}
      withBorder={false}
      radius={10}
      className={cn("h-full", disabled && "cursor-not-allowed")}
    >
      <Box
        component={"span"}
        className={cn(
          "flex h-full flex-col gap-2.5 rounded-[10px] border-solid bg-[#1a1a1a] px-2.5 pb-3 pt-2.5 text-left transition-colors",
          checked
            ? "border-[1.5px] border-[#f15025]"
            : "border border-[#2a2a2a]",
          !disabled && !checked && "hover:border-[#3a3a3a]",
        )}
      >
        <Box component={"span"} className={"relative block"}>
          <Box
            component={"span"}
            className={cn("block", disabled && "opacity-50")}
          >
            <ThemePreview palette={palette} />
          </Box>
          {withComingSoonBadge && (
            <SettingsComingSoonBadge className={"absolute right-1.5 top-1.5"} />
          )}
        </Box>
        <Box
          component={"span"}
          className={cn("flex items-center gap-2", disabled && "opacity-60")}
        >
          <SettingsRadioDot checked={checked} />
          <Box
            component={"span"}
            className={"flex min-w-0 flex-1 flex-col gap-0.5"}
          >
            <Text
              component={"span"}
              fz={14}
              fw={600}
              c={"white"}
              lh={"normal"}
              truncate
            >
              {label}
            </Text>
            {description && (
              <Text
                component={"span"}
                fz={12}
                lh={"normal"}
                truncate
                className={"text-[#7a7a7a]"}
              >
                {description}
              </Text>
            )}
          </Box>
        </Box>
      </Box>
    </Radio.Card>
  );
}
