import { cn } from "#@/util";
import { Paper } from "@mantine/core";
import type { ReactNode } from "react";

export interface AwardsVoteBarProps {
  children: ReactNode;
  /** Pins the container to the bottom of the viewport (mobile layout slot). */
  fixed?: boolean;
  className?: string;
}

/**
 * Surface of the vote bar. On desktop it is the card under the nominee grid
 * (`vote-bar`, frame `5410:689`); on mobile it is the sticky confirm sheet
 * (frame `5412:845`). The vote actions and mutations live in the ballot
 * screen, see `AwardsVoteBarContent`.
 */
const AwardsVoteBar = ({
  children,
  fixed = false,
  className,
}: AwardsVoteBarProps) => {
  return (
    <Paper
      data-awards-vote-bar
      data-fixed={fixed ? "true" : "false"}
      radius={0}
      className={cn(
        "w-full",
        fixed
          ? "fixed inset-x-0 bottom-0 z-40 border border-line bg-paper-0 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-3.5"
          : "rounded-[14px] border border-line bg-paper-5 py-4 pl-5 pr-4",
        className,
      )}
    >
      {children}
    </Paper>
  );
};

export { AwardsVoteBar };
