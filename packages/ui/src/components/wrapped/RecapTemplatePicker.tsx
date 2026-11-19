import {
  RECAP_CARD_FORMATS,
  type RecapCardFormat,
} from "#@/components/wrapped/card/recapCardFormats";
import { cn } from "#@/util";
import { Text, UnstyledButton } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import type { ReactNode } from "react";

export type RecapTemplate = "poster" | "dash" | "bento" | "aura" | "summary";

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
  aura: (
    <div className={"relative flex flex-col gap-1 w-full h-full p-1.5"}>
      <div
        className={"absolute inset-0"}
        style={{
          background:
            "radial-gradient(circle at 15% 12%, rgba(241,80,37,0.7), transparent 60%), radial-gradient(circle at 90% 50%, rgba(45,106,143,0.5), transparent 55%)",
        }}
      />
      <div className={"relative flex gap-0.5 h-5"}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("flex-1 rounded-[2px]", FILL)} />
        ))}
      </div>
      <div className={cn("relative h-5 w-3/4 rounded-[2px]", LINE)} />
      <div className={"relative grid grid-cols-2 gap-0.5 flex-1"}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={cn("rounded-[2px]", FILL)} />
        ))}
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
  /**
   * Live miniature of a template. The wireframe is drawn until it returns
   * something, so the picker still works before the data has loaded.
   */
  renderPreview?: (template: RecapTemplate) => ReactNode;
}

/** The native-size card, scaled to the width of its thumbnail. */
function Thumb({
  format,
  preview,
  fallback,
  active,
}: {
  format: RecapCardFormat;
  preview: ReactNode;
  fallback: ReactNode;
  active: boolean;
}) {
  const { ref, width } = useElementSize();
  const size = RECAP_CARD_FORMATS[format];
  const scale = width > 0 ? width / size.width : 0;

  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full overflow-hidden rounded-lg bg-[#0F0E0D] transition-shadow",
        active
          ? "ring-2 ring-[#F15025]"
          : "ring-1 ring-white/10 group-hover:ring-white/25",
      )}
      style={{ aspectRatio: `${size.width} / ${size.height}` }}
    >
      {preview && scale > 0 ? (
        <div
          aria-hidden
          className={"absolute left-0 top-0 pointer-events-none"}
          style={{
            width: size.width,
            height: size.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {preview}
        </div>
      ) : (
        fallback
      )}
    </div>
  );
}

/** Template choice as a row of thumbnails of the real card. */
export function RecapTemplatePicker({
  value,
  options,
  format,
  getLabel,
  onChange,
  renderPreview,
}: PickerProps) {
  return (
    <div
      role={"radiogroup"}
      className={"grid gap-3"}
      style={{
        gridTemplateColumns: `repeat(${Math.max(
          options.length,
          3,
        )}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => {
        const active = option === value;
        const label = getLabel(option);
        return (
          <UnstyledButton
            key={option}
            role={"radio"}
            aria-checked={active}
            aria-label={label}
            onClick={() => onChange(option)}
            className={"group flex flex-col items-center gap-2"}
          >
            <Thumb
              format={format}
              active={active}
              preview={renderPreview?.(option)}
              fallback={WIREFRAMES[option]}
            />
            <Text
              size={"xs"}
              fw={active ? 600 : 500}
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
