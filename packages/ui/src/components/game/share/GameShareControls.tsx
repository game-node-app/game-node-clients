import { cn } from "#@/util";
import { UnstyledButton } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { type KeyboardEvent, type ReactNode, useRef } from "react";

interface ToggleChipProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}

/** Pill that switches one block of the card on or off ("Game Share / Toggle Chip"). */
export function GameShareToggleChip({
  checked,
  onChange,
  children,
}: ToggleChipProps) {
  return (
    <UnstyledButton
      type={"button"}
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-1.5 rounded-full border border-solid py-2 text-[13px] font-medium transition-colors",
        checked
          ? "border-brand bg-brand-tint pl-2.5 pr-3.5 text-emphasis"
          : "border-line-strong px-3.5 text-subtle hover:text-emphasis",
      )}
    >
      {checked && <IconCheck size={14} stroke={2} className={"text-brand"} />}
      {children}
    </UnstyledButton>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  /** Names the group for assistive tech. */
  ariaLabel: string;
  className?: string;
  /** Locks the choice, e.g. while an export reads the current selection. */
  disabled?: boolean;
}

/**
 * Single-choice control. It is a radio group, so it takes one tab stop and the
 * arrow keys move the choice.
 */
export function GameShareSegmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
  className,
  disabled = false,
}: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const next = options[(index + options.length) % options.length];
    onChange(next.value);
    refs.current[(index + options.length) % options.length]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(index - 1);
    }
  };

  return (
    <div
      role={"radiogroup"}
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        "flex w-full items-start gap-1 rounded-[10px] border border-solid border-line bg-paper-0 p-1",
        className,
      )}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type={"button"}
            role={"radio"}
            aria-checked={selected}
            disabled={disabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[7px] py-[9px] text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              selected
                ? "bg-paper-1 font-semibold text-emphasis"
                : "font-medium text-subtle hover:text-emphasis",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
