import { Box, Radio, Text } from "@mantine/core";
import { ReactNode } from "react";
import { useTranslation } from "@repo/locales";
import {
  SettingsComingSoonBadge,
  SettingsNewBadge,
  SettingsPill,
} from "#@/components/settings/common/SettingsPill";
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
          ? "border-[5px] border-brand bg-foreground"
          : "border-[1.5px] border-dimmed-3",
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
        palette.bordered && "border border-solid border-line",
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
  /** The theme is available to Supporters. */
  locked?: boolean;
  /** Shows a "New" badge next to the label. */
  isNew?: boolean;
}

/** Selectable theme card with a drawn preview (Figma "Tema" / "Settings / Tema especial"). */
export function SettingsThemeOptionCard({
  value,
  label,
  description,
  palette,
  checked,
  disabled = false,
  locked = false,
  isNew = false,
}: Props) {
  const { t } = useTranslation();
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
          "flex h-full flex-col gap-2.5 rounded-[10px] border-solid bg-paper-8 px-2.5 pb-3 pt-2.5 text-left transition-colors",
          checked ? "border-[1.5px] border-brand" : "border border-line",
          !disabled && !checked && "hover:border-line-strong",
        )}
      >
        <Box component={"span"} className={"relative block"}>
          <Box
            component={"span"}
            className={cn("block", disabled && "opacity-50")}
          >
            <ThemePreview palette={palette} />
          </Box>
          {checked ? (
            <SettingsPill className={"absolute right-1.5 top-1.5"}>
              {t("settings.badges.current")}
            </SettingsPill>
          ) : locked ? (
            <SettingsPill className={"absolute right-1.5 top-1.5"}>
              {t("settings.appearance.theme.supporterOnly")}
            </SettingsPill>
          ) : disabled ? (
            <SettingsComingSoonBadge className={"absolute right-1.5 top-1.5"} />
          ) : null}
        </Box>
        <Box
          component={"span"}
          className={cn(
            "flex min-w-0 flex-col gap-0.5",
            disabled && "opacity-60",
          )}
        >
          <Box component={"span"} className={"flex items-center gap-2"}>
            <SettingsRadioDot checked={checked} />
            <Text
              component={"span"}
              fz={14}
              fw={600}
              c={"var(--gn-text)"}
              lh={"normal"}
              truncate
              className={"min-w-0 flex-1"}
            >
              {label}
            </Text>
            {isNew && <SettingsNewBadge />}
          </Box>
          {description && (
            <Text
              component={"span"}
              fz={12}
              lh={"normal"}
              className={"break-words ps-[26px] text-dimmed-3"}
            >
              {description}
            </Text>
          )}
        </Box>
      </Box>
    </Radio.Card>
  );
}
