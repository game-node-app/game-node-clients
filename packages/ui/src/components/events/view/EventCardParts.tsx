import { EventDeadlineDot } from "#@/assets/events/EventDeadlineDot";
import { EventGlow } from "#@/assets/events/EventGlow";
import { EventLiveDot } from "#@/assets/events/EventLiveDot";
import { cn } from "#@/util";
import {
  Badge,
  Button,
  type ButtonProps,
  type PolymorphicComponentProps,
  Text,
  Title,
} from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";
import type { EventCardLayout } from "./EventCard";

export interface EventCardShellProps {
  kind: string;
  layout: EventCardLayout;
  /**
   * Art column of the Half layout (frame `5444:2034`: 196 px wide, right of the
   * 308 px text column). It is hidden when the card is too narrow for it.
   */
  art?: ReactNode;
  children: ReactNode;
}

/**
 * Surface shared by every Home event card (frame `5444:2410`): 20 px radius,
 * 27 px padding, `#161616` surface, `#2a2a2a` border and the brand glow clipped
 * at the top-right corner.
 */
export function EventCardShell({
  kind,
  layout,
  art,
  children,
}: EventCardShellProps) {
  const isHalf = layout === "half";

  return (
    <article
      data-testid={"event-card"}
      data-kind={kind}
      data-layout={layout}
      className={cn(
        "@container relative flex h-full overflow-hidden rounded-[20px] border border-line bg-paper-0",
        isHalf && "min-h-[328px]",
        layout === "mobile" && "w-full shrink-0",
      )}
    >
      <div
        aria-hidden={"true"}
        className={
          "pointer-events-none absolute -right-[119px] -top-[241px] size-[420px]"
        }
      >
        <EventGlow className={"absolute -inset-[40%] size-[180%]"} />
      </div>
      <div
        className={cn(
          "relative flex w-full min-w-0 p-[27px]",
          layout === "wide"
            ? "flex-col gap-5 md:flex-row md:items-stretch md:gap-8"
            : isHalf
              ? "flex-row gap-8"
              : "flex-col gap-5",
        )}
      >
        {children}
        {isHalf && art ? (
          <div
            data-testid={"event-card-art"}
            // Dropped below ~560 px of card width: the 196 px column would
            // squeeze the text column.
            className={"relative hidden w-[196px] shrink-0 @[560px]:block"}
          >
            {art}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export interface EventCardEyebrowProps {
  children: ReactNode;
  /** Right-aligned element of the row, e.g. the deadline chip. */
  trailing?: ReactNode;
}

/** "ao-vivo" mark plus the uppercase event name, with an optional chip. */
export function EventCardEyebrow({
  children,
  trailing,
}: EventCardEyebrowProps) {
  return (
    <div
      className={"flex flex-wrap items-center justify-between gap-x-2 gap-y-2"}
    >
      <div className={"flex min-w-0 items-center gap-2"}>
        <EventLiveDot className={"shrink-0"} />
        <Text
          fz={12}
          fw={700}
          lh={"normal"}
          className={"uppercase tracking-[0.06em] text-brand-3"}
        >
          {children}
        </Text>
      </div>
      {trailing}
    </div>
  );
}

export interface EventCardHeadlineProps {
  layout: EventCardLayout;
  children: ReactNode;
}

/** 26/32 headline (20/26 in the 300 px mobile card). */
export function EventCardHeadline({
  layout,
  children,
}: EventCardHeadlineProps) {
  const isMobile = layout === "mobile";

  return (
    <Title
      order={3}
      fz={isMobile ? 20 : 26}
      lh={isMobile ? "26px" : "32px"}
      fw={700}
      className={"tracking-[-0.01em] text-white"}
    >
      {children}
    </Title>
  );
}

/** 14/21 body copy of the cards, in the secondary text tone. */
export function EventCardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Text fz={14} lh={"21px"} className={cn("text-nav-muted", className)}>
      {children}
    </Text>
  );
}

const PRIMARY_BUTTON_STYLE = {
  "--button-height": "48px",
  "--button-padding-x": "22px",
  "--button-fz": "15px",
  "--button-radius": "10px",
  "--button-color": "#0b0b0b",
} as CSSProperties;

const SECONDARY_BUTTON_STYLE = {
  "--button-height": "48px",
  "--button-padding-x": "22px",
  "--button-fz": "15px",
  "--button-radius": "10px",
  "--button-color": "#ffffff",
} as CSSProperties;

type EventCardButtonProps = PolymorphicComponentProps<"button", ButtonProps> & {
  tone?: "primary" | "secondary";
};

/**
 * 48 px / 10 px radius card button (`Button / …`, `5408:680`). The primary is
 * the brand fill with dark text; the secondary is the borderless ghost.
 */
export function EventCardButton({
  tone = "primary",
  style,
  ...props
}: EventCardButtonProps) {
  const isPrimary = tone === "primary";

  return (
    <Button
      variant={isPrimary ? "filled" : "subtle"}
      color={isPrimary ? undefined : "gray"}
      style={{
        ...(isPrimary ? PRIMARY_BUTTON_STYLE : SECONDARY_BUTTON_STYLE),
        ...style,
      }}
      {...props}
    />
  );
}

/** `Chip / prazo`: the "Fecha amanhã" pill with its 6 px dot. */
export function EventCardDeadline({ children }: { children: ReactNode }) {
  return (
    <Badge
      variant={"light"}
      leftSection={<EventDeadlineDot />}
      style={
        {
          "--badge-height": "24px",
          "--badge-fz": "12px",
          "--badge-padding-x": "10px",
        } as CSSProperties
      }
      className={"shrink-0 tracking-[0.06em]"}
    >
      {children}
    </Badge>
  );
}
