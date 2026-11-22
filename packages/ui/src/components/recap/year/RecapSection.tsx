import { cn } from "#@/util";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * Flat full-width block of the Recap page (frames 5415:923 … 5420:945): no
 * card around it, the page canvas is the background and the content column is
 * 1200px wide. Spacing follows the design: 120px above and 96px below on
 * desktop, tighter on small screens.
 */
export function RecapSection({
  className,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      {...props}
      className={cn(
        "flex w-full flex-col pt-16 pb-6 md:pt-[120px] md:pb-0",
        className,
      )}
    />
  );
}

/** Small uppercase label above a section title (12px, bold, tracked). */
export function RecapEyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs leading-none font-bold tracking-[0.06em] text-brand-3 uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** 44px section heading. */
export function RecapHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "m-0 text-3xl leading-[1.18] font-semibold tracking-[-0.01em] text-foreground md:text-[44px] md:leading-[52px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/** 20px supporting paragraph under a heading. */
export function RecapLead({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "m-0 text-base leading-normal text-[#adadad] md:text-xl",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Bordered surface used by the community, genre, platform, fact and goal blocks. */
export function RecapSurface({
  className,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "rounded-2xl border border-line bg-paper-0 p-5 md:p-7",
        className,
      )}
    />
  );
}
