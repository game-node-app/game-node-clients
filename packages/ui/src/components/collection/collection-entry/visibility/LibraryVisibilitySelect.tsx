import { Group, Select, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import type { ReactNode } from "react";
import type { LibraryVisibilityLevel } from "./LibraryVisibilityLevel";
import { useLibraryVisibilityOptions } from "./useLibraryVisibilityOptions";

export interface LibraryVisibilitySelectProps {
  /** Selected level. The component is fully controlled. */
  value: LibraryVisibilityLevel;
  onChange: (value: LibraryVisibilityLevel) => void;
  disabled?: boolean;
  /** Optional field label. Omit in settings rows that already have a title. */
  label?: ReactNode;
  /** Optional field description shown under the input. */
  description?: ReactNode;
  className?: string;
}

/**
 * Select for a library visibility level. Reused by the per-game form, the
 * owner's quick action and the privacy settings, so the three levels always
 * read the same everywhere.
 */
export function LibraryVisibilitySelect({
  value,
  onChange,
  disabled,
  label,
  description,
  className,
}: LibraryVisibilitySelectProps) {
  const { t } = useTranslation();
  const options = useLibraryVisibilityOptions();
  const selectedOption = options.find((option) => option.value === value);
  const SelectedIcon = selectedOption?.icon;

  return (
    <Select
      className={className}
      label={label}
      description={description}
      data={options.map((option) => ({
        value: option.value,
        label: option.label,
      }))}
      value={value}
      onChange={(nextValue) => {
        if (nextValue) {
          onChange(nextValue as LibraryVisibilityLevel);
        }
      }}
      leftSection={SelectedIcon ? <SelectedIcon size={16} /> : undefined}
      disabled={disabled}
      allowDeselect={false}
      // The mobile app renders modals as `ion-modal` (z-index 20000), so the
      // dropdown must sit above them; Mantine's default is 300.
      comboboxProps={{ zIndex: 30000 }}
      aria-label={
        label == undefined
          ? t("libraryVisibility.labels.visibility")
          : undefined
      }
      renderOption={({ option }) => {
        const visibilityOption = options.find(
          (candidate) => candidate.value === option.value,
        );

        if (visibilityOption == undefined) {
          return option.label;
        }

        const Icon = visibilityOption.icon;

        return (
          <Group gap={"sm"} wrap={"nowrap"}>
            <Icon size={18} className={"shrink-0"} aria-hidden />
            <Stack gap={0}>
              <Text size={"sm"}>{visibilityOption.label}</Text>
              <Text size={"xs"} c={"dimmed"}>
                {visibilityOption.description}
              </Text>
            </Stack>
          </Group>
        );
      }}
    />
  );
}
