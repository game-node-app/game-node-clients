import { VisuallyHidden } from "@mantine/core";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "#@/util";

import type { LinaSegment } from "../util";
import styles from "../guild.module.css";

import { GuildIcon } from "./GuildIcon";
import { useTypewriter } from "./useTypewriter";

export type LinaDialogueVariant = "desktop" | "mobile" | "modal";

export interface LinaDialogueOption {
  id: string;
  label: string;
  onSelect(): void;
}

export interface LinaDialogueProps {
  /** Name plate text, e.g. `Lina · Recepcionista da Guilda`. */
  speaker: string;
  /** Lina's line from `getLinaLine`, already localized and split on gold names. */
  segments: LinaSegment[];
  options?: LinaDialogueOption[];
  /** Extra controls, e.g. the early-access or accepted-state buttons. */
  actions?: ReactNode;
  variant: LinaDialogueVariant;
  /** Typewriter delay; defaults to the hall's 400 ms (design D5). */
  startDelayMs?: number;
  onTypingChange?(typing: boolean): void;
  /** Renders only the name plate; activating it calls `onExpand`. */
  collapsed?: boolean;
  onExpand?(): void;
}

const DEFAULT_START_DELAY_MS = 400;

const VARIANT_CLASSES: Record<LinaDialogueVariant, string> = {
  desktop: styles.linaDialogueDesktop,
  mobile: styles.linaDialogueMobile,
  modal: styles.linaDialogueModal,
};

function getSegmentOffsets(segments: readonly LinaSegment[]): number[] {
  const offsets: number[] = [];
  let offset = 0;

  for (const segment of segments) {
    offsets.push(offset);
    offset += segment.text.length;
  }

  return offsets;
}

/**
 * Lina's pixel dialogue box (design D6): a typewritten line with gold
 * highlights, arrow-key options with the pixel cursor, the blinking `▼` and a
 * name plate that can collapse to a compact, reopenable plate.
 */
export function LinaDialogue({
  speaker,
  segments,
  options,
  actions,
  variant,
  startDelayMs = DEFAULT_START_DELAY_MS,
  onTypingChange,
  collapsed = false,
  onExpand,
}: LinaDialogueProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { revealed, total, isTyping, complete } = useTypewriter(segments, {
    startDelayMs,
  });
  const onTypingChangeRef = useRef(onTypingChange);

  useEffect(() => {
    onTypingChangeRef.current = onTypingChange;
  }, [onTypingChange]);

  const reportedTyping = !collapsed && isTyping;

  useEffect(() => {
    onTypingChangeRef.current?.(reportedTyping);
  }, [reportedTyping]);

  useEffect(
    () => () => {
      onTypingChangeRef.current?.(false);
    },
    [],
  );

  const fullText = segments.map((segment) => segment.text).join("");
  const segmentOffsets = getSegmentOffsets(segments);
  const textNodes = segments.map((segment, index) => {
    const start = segmentOffsets[index] ?? 0;
    const visibleLength = Math.max(
      0,
      Math.min(segment.text.length, revealed - start),
    );

    return (
      <span
        key={index}
        className={segment.highlight ? styles.linaSegmentHighlight : undefined}
      >
        {segment.text.slice(0, visibleLength)}
        {visibleLength < segment.text.length ? (
          <span className={styles.linaHidden}>
            {segment.text.slice(visibleLength)}
          </span>
        ) : null}
      </span>
    );
  });

  const showNext = Boolean(options?.length) && !isTyping && total > 0;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!options?.length) return;
        event.preventDefault();
        const delta = event.key === "ArrowDown" ? 1 : -1;
        const nextIndex =
          (activeIndex + delta + options.length) % options.length;
        setActiveIndex(nextIndex);
        // Move real focus with the pixel cursor so Enter activates the option
        // under the cursor instead of the previously focused one.
        optionRefs.current[nextIndex]?.focus();
        return;
      }

      // Enter/Space on an option or the CTA keep their native behaviour.
      if (event.target !== event.currentTarget) return;

      if (
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        event.preventDefault();
        if (isTyping) {
          complete();
          return;
        }
        if (options?.length) {
          options[Math.min(activeIndex, options.length - 1)]?.onSelect();
        }
      }
    },
    [activeIndex, complete, isTyping, options],
  );

  if (collapsed) {
    return (
      <div
        className={cn(styles.linaCollapsed, VARIANT_CLASSES[variant])}
        data-variant={variant}
        data-collapsed="true"
      >
        <button
          type="button"
          className={styles.linaCollapsedPlate}
          onClick={onExpand}
          aria-expanded={false}
        >
          {speaker}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(styles.linaDialogue, VARIANT_CLASSES[variant])}
      data-variant={variant}
      data-typing={isTyping}
      data-collapsed="false"
      role="dialog"
      aria-label={speaker}
      tabIndex={0}
      onClick={() => {
        if (isTyping) complete();
      }}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.linaNamePlate}>{speaker}</span>

      <p className={cn(styles.pixelDialog, styles.linaText)} aria-hidden="true">
        {textNodes}
      </p>
      <VisuallyHidden>{fullText}</VisuallyHidden>

      {actions ? <div className={styles.linaActions}>{actions}</div> : null}

      {options && options.length > 0 ? (
        <div className={styles.linaOptions}>
          {options.map((option, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={option.id}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                className={styles.linaOption}
                data-active={isActive}
                data-option-id={option.id}
                onClick={() => {
                  if (isTyping) complete();
                  option.onSelect();
                }}
                onFocus={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
              >
                {isActive ? (
                  <GuildIcon
                    name="cursor"
                    className={cn(styles.linaOptionCursor, styles.animCursor)}
                  />
                ) : (
                  <span className={styles.linaOptionSpacer} aria-hidden />
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      {showNext ? (
        <span
          className={cn(styles.linaNext, styles.animNext)}
          aria-hidden="true"
        >
          ▼
        </span>
      ) : null}
    </div>
  );
}
