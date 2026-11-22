import { cn } from "#@/util";
import type { HTMLAttributes } from "react";

export interface AwardsSegmentedControlOption<TValue extends string> {
  value: TValue;
  label: string;
}

export interface AwardsSegmentedControlProps<TValue extends string>
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: TValue;
  onChange: (value: TValue) => void;
  options: AwardsSegmentedControlOption<TValue>[];
  /** Track color: the ballot filter is canvas-dark on its panel, the result filter is a surface on the canvas. */
  surface?: "canvas" | "surface";
  /** Stretches the segments to the container width (mobile frames). */
  fullWidth?: boolean;
  /** Value painted with the "played" tone when selected (mobile result filter). */
  playedValue?: TValue;
  className?: string;
}

/**
 * Segmented filter of the Awards frames: a 10 px track with 4 px padding and
 * 7 px segments; the selected one is `#262525` (or green for the played
 * filter on the mobile result).
 */
export function AwardsSegmentedControl<TValue extends string>({
  value,
  onChange,
  options,
  surface = "surface",
  fullWidth = false,
  playedValue,
  className,
  ...rest
}: AwardsSegmentedControlProps<TValue>) {
  return (
    <div
      role={"radiogroup"}
      className={cn(
        "flex gap-1 rounded-[10px] border border-line p-1",
        surface === "canvas" ? "bg-nav-canvas" : "bg-paper-0",
        fullWidth ? "w-full" : "w-fit max-w-full",
        className,
      )}
      {...rest}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const played = selected && option.value === playedValue;

        return (
          <button
            key={option.value}
            type={"button"}
            role={"radio"}
            aria-checked={selected}
            data-selected={selected ? "true" : "false"}
            onClick={() => onChange(option.value)}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-[7px] border border-transparent px-3 py-2 text-[14px] leading-[1.43] transition-colors md:px-[14px]",
              fullWidth && "flex-1",
              selected
                ? "bg-paper-1 font-medium text-foreground"
                : "font-normal text-nav-muted hover:text-foreground",
              played &&
                "border-state-played bg-state-played-tint text-state-played",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
