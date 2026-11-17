import { cn } from "#@/util";
import type { HTMLAttributes, ReactNode } from "react";

export type AwardsChipTone = "brand" | "played" | "neutral";

const TONE_CLASSES: Record<AwardsChipTone, string> = {
  brand: "bg-brand-tint text-brand-3",
  played: "bg-state-played-tint text-state-played",
  neutral: "bg-paper-1 text-nav-muted",
};

/** Legacy Mantine color names exposed as `data-color` for the chip tones. */
const TONE_DATA_COLORS: Record<AwardsChipTone, string> = {
  brand: "brand",
  played: "teal",
  neutral: "gray",
};

export interface AwardsStatusChipProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  tone: AwardsChipTone;
  children: ReactNode;
}

/**
 * Pill chip of the Awards design (component `5408:695`): a 6 px dot and an
 * uppercase 12 px label, in the Brand, Played or Neutral tone.
 */
const AwardsStatusChip = ({
  tone,
  children,
  className,
  ...rest
}: AwardsStatusChipProps) => {
  return (
    <span
      data-color={TONE_DATA_COLORS[tone]}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 self-start rounded-full py-[5px] pl-2 pr-2.5",
        "text-[12px] font-bold uppercase leading-[normal] tracking-[0.72px]",
        TONE_CLASSES[tone],
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden={"true"}
        className={"size-1.5 shrink-0 rounded-full bg-current"}
      />
      <span className={"truncate"}>{children}</span>
    </span>
  );
};

export { AwardsStatusChip };
