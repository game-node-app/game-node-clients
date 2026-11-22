import { IonItem } from "@ionic/react";
import { cn } from "@repo/ui";
import { IconChevronRight } from "@tabler/icons-react";
import type { ReactNode } from "react";

interface Props {
  /** Glyph or image shown inside the leading tile. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Muted value on the right (e.g. the current language), before the chevron. */
  value?: ReactNode;
  /** Router destination. Already tab-aware (`getTabAwareHref`). */
  href?: string;
  onClick?: () => void;
  /** Replaces the chevron with custom controls (buttons, selects). */
  trailing?: ReactNode;
  /** Brand-tinted icon tile, matches `CardSection accent`. */
  accent?: boolean;
  /** Violet icon tile and text, matches `CardSection premium` (supporter entry points only). */
  premium?: boolean;
  /** Show the chevron on tappable rows. @default true */
  chevron?: boolean;
  /** Content rendered under the text inside the row (e.g. inline actions or alerts). */
  footer?: ReactNode;
  /** Rendered next to the row, outside its layout (modals owned by the row). */
  children?: ReactNode;
}

/**
 * Single Preferences row: icon tile, title/description, then a value, chevron or custom trailing
 * controls. Built on IonItem so routing, ripple and button semantics stay native; the look
 * (transparent background, inset hairline) comes from `.gn-card` in globals.css.
 */
const CardRow = ({
  icon,
  title,
  description,
  value,
  href,
  onClick,
  trailing,
  accent,
  premium,
  chevron = true,
  footer,
  children,
}: Props) => {
  const interactive = href != undefined || onClick != undefined;

  return (
    <IonItem
      button={interactive}
      routerLink={href}
      onClick={onClick}
      detail={false}
      lines="full"
    >
      {children}
      <div className="flex w-full min-w-0 items-start gap-3 py-3">
        {icon != undefined && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              premium
                ? "bg-[#9747FF] text-white"
                : accent
                  ? "bg-brand text-on-brand-alt"
                  : "bg-paper-4 text-legacy-neutral-300",
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex min-h-10 items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[15px] font-medium leading-5 text-foreground [overflow-wrap:anywhere]">
                {title}
              </p>
              {description != undefined && (
                <p
                  className={cn(
                    "m-0 mt-0.5 text-[13px] leading-4 [overflow-wrap:anywhere]",
                    premium ? "text-[#C7A6FF]" : "text-dimmed-1",
                  )}
                >
                  {description}
                </p>
              )}
            </div>
            {value != undefined && (
              <span className="shrink-0 text-sm text-dimmed-1">{value}</span>
            )}
            {trailing}
            {interactive && chevron && trailing == undefined && (
              <IconChevronRight
                size={18}
                className={cn(
                  "shrink-0",
                  premium ? "text-[#C7A6FF]" : "text-dimmed-1",
                )}
              />
            )}
          </div>
          {footer}
        </div>
      </div>
    </IonItem>
  );
};

export { CardRow };
