import { cn } from "@repo/ui";
import type { PropsWithChildren, ReactNode } from "react";

interface Props extends PropsWithChildren {
  /** Small caption above the card. Omit for a standalone card (e.g. the supporter highlight). */
  title?: ReactNode;
  /** Brand-tinted card, reserved for the one thing we want to draw attention to. */
  accent?: boolean;
  className?: string;
}

/**
 * One group of card rows: a caption on the page background and a rounded card holding the
 * rows. Every card block goes through this so spacing, radius and dividers stay in one place
 * (dividers are drawn by `.gn-card` in globals.css).
 */
const CardSection = ({ title, accent, className, children }: Props) => (
  <section className={cn("px-4", className)}>
    {title != undefined && (
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-dimmed-1">
        {title}
      </h2>
    )}
    <div
      className={cn(
        "gn-card overflow-hidden rounded-2xl border",
        accent
          ? "border-brand/40 bg-gradient-to-br from-brand/20 via-brand/5 to-paper-8"
          : "border-line bg-paper-8",
      )}
    >
      {children}
    </div>
  </section>
);

export { CardSection };
