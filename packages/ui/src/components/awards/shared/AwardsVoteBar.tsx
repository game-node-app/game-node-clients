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
 * Presentational slot for the vote bar. The vote actions and mutations are
 * implemented by the ballot screen.
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
      className={cn(
        "w-full",
        fixed &&
          "fixed inset-x-0 bottom-0 z-40 rounded-none border-t border-paper-4 bg-paper-2 p-3",
        className,
      )}
    >
      {children}
    </Paper>
  );
};

export { AwardsVoteBar };
