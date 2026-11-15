import type { RecapCardFormat } from "#@/components/wrapped/card/recapCardFormats";
import { cn } from "#@/util";
import { Text, UnstyledButton } from "@mantine/core";
import type { ReactNode } from "react";

export type RecapTemplate = "poster" | "dash" | "bento" | "summary";

const BRAND = "bg-[#F15025]";
const INK = "bg-[#0B0A09]/70";
const LINE = "bg-white/30";
const FILL = "bg-white/15";

/** Little wireframes of each layout, so the choice is made by sight. */
const WIREFRAMES: Record<RecapTemplate, ReactNode> = {
  poster: (
    <div className={"flex flex-col gap-1 w-full h-full p-1.5"}>
      <div className={cn("h-0.5 w-1/2", LINE)} />
      <div
        className={cn(
          "rounded-md flex flex-col justify-end gap-0.5 p-1 h-9",
          BRAND,
        )}
      >
        <div className={cn("h-1.5 w-full rounded-[1px]", INK)} />
        <div className={cn("h-1.5 w-4/5 rounded-[1px]", INK)} />
      </div>
      <div className={cn("h-1.5 w-3/4", LINE)} />
      <div className={"flex flex-col gap-0.5"}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("h-1", FILL)} />
        ))}
      </div>
    </div>
  ),
  dash: (
    <div className={"flex flex-col gap-1 w-full h-full p-1.5"}>
      <div className={cn("h-0.5 w-1/3", LINE)} />
      <div className={cn("h-7 w-3/4 rounded-[2px]", BRAND)} />
      <div className={cn("h-1 w-1/2", LINE)} />
      <div className={"flex gap-0.5 flex-1"}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn("flex-1 rounded-[2px]", FILL)} />
        ))}
      </div>
      <div className={"flex gap-0.5 h-3"}>
        <div className={cn("flex-1 rounded-[2px]", FILL)} />
        <div className={cn("flex-1 rounded-[2px]", FILL)} />
      </div>
    </div>
  ),
  bento: (
    <div className={"flex flex-col gap-0.5 w-full h-full p-1.5"}>
      <div className={cn("h-10 rounded-[3px]", BRAND)} />
      <div className={"flex gap-0.5 h-5"}>
        <div className={cn("flex-1 rounded-[2px]", FILL)} />
        <div className={cn("flex-1 rounded-[2px]", FILL)} />
      </div>
      <div className={cn("flex-1 rounded-[2px]", FILL)} />
      <div className={"flex gap-0.5 h-4"}>
        <div className={cn("flex-1 rounded-[2px]", FILL)} />
        <div className={cn("flex-1 rounded-[2px]", FILL)} />
      </div>
    </div>
  ),
  summary: (
    <div className={"flex gap-1 w-full h-full p-1.5"}>
      <div className={"flex flex-col gap-1 w-2/5"}>
        <div className={cn("h-5 rounded-[2px]", BRAND)} />
        <div className={cn("h-1 w-3/4", LINE)} />
      </div>
      <div className={cn("w-1/4 rounded-[2px]", FILL)} />
      <div className={"grid grid-cols-2 gap-0.5 flex-1"}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("rounded-[1px]", FILL)} />
        ))}
      </div>
    </div>
  ),
};

interface PickerProps {
  value: RecapTemplate;
  options: RecapTemplate[];
  format: RecapCardFormat;
  getLabel: (template: RecapTemplate) => string;
  onChange: (template: RecapTemplate) => void;
}

/** Template choice as a row of layout thumbnails. */
export function RecapTemplatePicker({
  value,
  options,
  format,
  getLabel,
  onChange,
}: PickerProps) {
  const portrait = format === "story";

  return (
    <div role={"radiogroup"} className={"grid grid-cols-4 gap-2"}>
      {options.map((option) => {
        const active = option === value;
        const label = getLabel(option);
        const tall = portrait;
        return (
          <UnstyledButton
            key={option}
            role={"radio"}
            aria-checked={active}
            aria-label={label}
            onClick={() => onChange(option)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-lg p-2 border transition-colors",
              active
                ? "border-[#F15025] bg-[#F15025]/10"
                : "border-white/10 hover:border-white/25 bg-white/[0.03]",
            )}
          >
            <div
              className={cn(
                "rounded-md bg-[#0F0E0D] border border-white/10 overflow-hidden",
                tall ? "w-11 h-20" : "w-16 h-9",
              )}
            >
              {WIREFRAMES[option]}
            </div>
            <Text
              size={"xs"}
              fw={active ? 700 : 500}
              c={active ? "white" : "dimmed"}
            >
              {label}
            </Text>
          </UnstyledButton>
        );
      })}
    </div>
  );
}

interface FormatProps {
  value: RecapCardFormat;
  storyLabel: string;
  feedLabel: string;
  onChange: (format: RecapCardFormat) => void;
}

/** Story / Feed switch drawn with the aspect of each format. */
export function RecapFormatToggle({
  value,
  storyLabel,
  feedLabel,
  onChange,
}: FormatProps) {
  const items: { format: RecapCardFormat; label: string; box: string }[] = [
    { format: "story", label: storyLabel, box: "w-3 h-5" },
    { format: "feed", label: feedLabel, box: "w-5 h-3" },
  ];

  return (
    <div role={"radiogroup"} className={"grid grid-cols-2 gap-2"}>
      {items.map((item) => {
        const active = item.format === value;
        return (
          <UnstyledButton
            key={item.format}
            role={"radio"}
            aria-checked={active}
            aria-label={item.label}
            onClick={() => onChange(item.format)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg h-11 border transition-colors",
              active
                ? "border-[#F15025] bg-[#F15025]/10"
                : "border-white/10 hover:border-white/25 bg-white/[0.03]",
            )}
          >
            <span
              className={cn(
                "rounded-[2px] border-2",
                item.box,
                active ? "border-[#F15025]" : "border-white/40",
              )}
            />
            <Text
              size={"sm"}
              fw={active ? 700 : 500}
              c={active ? "white" : "dimmed"}
            >
              {item.label}
            </Text>
          </UnstyledButton>
        );
      })}
    </div>
  );
}
