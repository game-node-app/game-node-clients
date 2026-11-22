import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import type { Icon } from "@tabler/icons-react";
import { cn } from "#@/util/cn";
import { Link } from "#@/util/link";

interface SectionProps {
  title: string;
  /** Muted caption on the right of the title. */
  caption?: ReactNode;
  /** Accent frame (the ranking panel). */
  highlighted?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * A right-column panel of the hub (frame 5051:13890).
 */
const DailyHubSection = ({
  title,
  caption,
  highlighted,
  children,
  className,
}: SectionProps) => (
  <section
    className={cn(
      "flex flex-col gap-3 rounded-[14px] border border-solid bg-paper-7 p-4 sm:p-5",
      highlighted ? "border-brand-5" : "border-line",
      className,
    )}
  >
    <div className={"flex items-center justify-between gap-3"}>
      <Text
        component={"h2"}
        fz={20}
        fw={700}
        c="var(--gn-text)"
        className={"m-0"}
      >
        {title}
      </Text>
      {caption}
    </div>
    {children}
  </section>
);

interface CardProps {
  href: string;
  icon: Icon;
  title: string;
  description: string;
  /** Right side: a status badge or similar. */
  aside?: ReactNode;
}

/** A dashed link card inside a hub section. */
const DailyHubLinkCard = ({
  href,
  icon: CardIcon,
  title,
  description,
  aside,
}: CardProps) => (
  <Link
    href={href}
    className={
      "flex items-center gap-3.5 rounded-[12px] border border-dashed border-line bg-paper-8 p-4 text-inherit no-underline transition-colors hover:border-line-strong"
    }
  >
    <span
      className={
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] bg-nav-raised text-foreground"
      }
    >
      <CardIcon size={20} aria-hidden />
    </span>
    <span className={"flex min-w-0 flex-1 flex-col gap-0.5"}>
      <Text component={"span"} fz={16} fw={600} c="var(--gn-text)">
        {title}
      </Text>
      <Text component={"span"} fz={13} c={"var(--gn-text-subtle)"}>
        {description}
      </Text>
    </span>
    {aside}
  </Link>
);

export { DailyHubSection, DailyHubLinkCard };
