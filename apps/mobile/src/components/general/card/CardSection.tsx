import { cn } from "@repo/ui";
import type { PropsWithChildren, ReactNode } from "react";

interface Props extends PropsWithChildren {
  /** Small caption above the card. Omit for a standalone card (e.g. the supporter highlight). */
  title?: ReactNode;
  /** Brand-tinted card, reserved for the one thing we want to draw attention to. */
  accent?: boolean;
  /**
   * Supporter (premium) card: the violet gradient + border + glow from DESIGN.md. Only supporter
   * entry points may use it.
   */
  premium?: boolean;
  className?: string;
}

/**
 * One group of card rows: a caption on the page background and a rounded card holding the
 * rows. Every card block goes through this so spacing, radius and dividers stay in one place
 * (dividers are drawn by `.gn-card` in globals.css). It adds no horizontal padding: the page
 * (`AppPage`'s `ion-padding`) owns the screen gutter.
 */
const CardSection = ({
  title,
  accent,
  premium,
  className,
  children,
}: Props) => (
  <section className={className}>
    {title != undefined && (
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-dimmed-1">
        {title}
      </h2>
    )}
    <div
      className={cn(
        "gn-card overflow-hidden rounded-2xl border",
        premium
          ? "border-[rgba(185,138,255,0.95)] bg-gradient-to-r from-[rgba(151,71,255,0.26)] via-[rgba(151,71,255,0.12)] via-60% to-[rgba(241,80,37,0.1)] shadow-[0_0_16px_0_rgba(151,71,255,0.32)]"
          : accent
            ? "border-brand/40 bg-gradient-to-br from-brand/20 via-brand/5 to-paper-8"
            : "border-line bg-paper-8",
      )}
    >
      {children}
    </div>
  </section>
);

export { CardSection };
