import {
  Button,
  ColorInput,
  Group,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconCheck } from "@tabler/icons-react";
import { useState } from "react";
import { getThemeCatalogEntry } from "#@/theme/generated/catalog";
import { cn } from "#@/util";
import { getOnAccentText, normalizeAccentHex } from "./accentColor";

/** Presets stored as hex colors by the profile accent picker. */
export const SUPPORTER_ACCENT_PRESETS = [
  "#9747FF", // theme-exempt: selectable accent swatch, stored as hex
  getThemeCatalogEntry(undefined).preview.accent,
  "#FF8800", // theme-exempt: selectable accent swatch, stored as hex
  "#F5C542", // theme-exempt: selectable accent swatch, stored as hex
  "#3DD68C", // theme-exempt: selectable accent swatch, stored as hex
  "#2EB8E6", // theme-exempt: selectable accent swatch, stored as hex
  "#4C7DFF", // theme-exempt: selectable accent swatch, stored as hex
  "#FF5FA2", // theme-exempt: selectable accent swatch, stored as hex
  "#E5484D", // theme-exempt: selectable accent swatch, stored as hex
] as const;

export interface SupporterAccentPickerProps {
  /** Stored value; `null` means the default accent. */
  accentColor: string | null;
  /** Called with an uppercase `#RRGGBB` value, or `null` on Reset. */
  onChange: (value: string | null) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Accent color control (design D7): nine presets, a free `#RRGGBB` input that
 * commits on blur/change-end, and a Reset that stores `null`. Invalid input
 * stays local, shows a hint and never reaches the server.
 */
export function SupporterAccentPicker({
  accentColor,
  onChange,
  disabled = false,
  className,
}: SupporterAccentPickerProps) {
  const { t } = useTranslation();
  // The draft is tied to the accent it started from, so a new prop (optimistic
  // save or rollback) always wins over stale typed text without an effect.
  const [draft, setDraft] = useState<{
    base: string | null;
    text: string;
  } | null>(null);
  const [invalid, setInvalid] = useState<{
    base: string | null;
    text: string;
  } | null>(null);

  const selected = normalizeAccentHex(accentColor);
  const value =
    draft && draft.base === accentColor ? draft.text : (accentColor ?? "");
  const isInvalid = Boolean(invalid && invalid.base === accentColor);

  const commit = () => {
    const normalized = normalizeAccentHex(value);

    if (!normalized) {
      setInvalid({ base: accentColor, text: value });
      return;
    }

    setInvalid(null);
    setDraft(null);

    if (normalized !== selected) {
      onChange(normalized);
    }
  };

  const pickPreset = (hex: string) => {
    setDraft(null);
    setInvalid(null);
    onChange(hex);
  };

  const reset = () => {
    setDraft(null);
    setInvalid(null);
    onChange(null);
  };

  return (
    <Stack gap={8} className={className}>
      <Group gap={8} wrap={"wrap"}>
        {SUPPORTER_ACCENT_PRESETS.map((hex) => {
          const isSelected = selected === hex;

          return (
            <UnstyledButton
              key={hex}
              type={"button"}
              aria-label={hex}
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => pickPreset(hex)}
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50",
                isSelected &&
                  "ring-2 ring-white ring-offset-2 ring-offset-paper-8",
              )}
              style={{ backgroundColor: hex }}
            >
              {isSelected && (
                <IconCheck
                  size={14}
                  stroke={2.5}
                  color={getOnAccentText(hex)}
                  aria-hidden
                />
              )}
            </UnstyledButton>
          );
        })}
      </Group>
      <Group gap={8} wrap={"wrap"} align={"center"}>
        <ColorInput
          aria-label={t("supporter.perks.accent.custom")}
          value={value}
          onChange={(next) => {
            setDraft({ base: accentColor, text: next });
            setInvalid(null);
          }}
          onChangeEnd={commit}
          onBlur={commit}
          format={"hex"}
          fixOnBlur={false}
          w={120}
          size={"xs"}
          withEyeDropper={false}
          disabled={disabled}
        />
        {accentColor !== null && (
          <Button
            type={"button"}
            variant={"subtle"}
            size={"compact-xs"}
            color={"gray"}
            onClick={reset}
            disabled={disabled}
          >
            {t("supporter.perks.accent.reset")}
          </Button>
        )}
      </Group>
      {isInvalid && (
        <Text fz={12} lh={"normal"} className={"text-status-danger-text"}>
          {t("supporter.perks.accent.invalid")}
        </Text>
      )}
    </Stack>
  );
}
