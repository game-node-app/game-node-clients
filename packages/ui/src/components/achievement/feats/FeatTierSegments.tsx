import { Box, Group } from "@mantine/core";
import type { FeatItem } from "../util/feats";

export interface FeatTierSegmentsProps {
  item: FeatItem;
}

type SegmentState = "obtained" | "in-progress" | "locked";

/**
 * One segment per tier: obtained, the next one in progress and the rest locked.
 * Single-tier feats have no segments, since the progress bar already shows the same thing.
 */
const FeatTierSegments = ({ item }: FeatTierSegmentsProps) => {
  const { tiers } = item.achievement;
  if (tiers.length <= 1) return null;

  const obtainedTier = item.progress?.tier ?? 0;

  return (
    <Group gap={4} wrap={"nowrap"} w={"100%"} aria-hidden data-feat-tiers>
      {tiers.map((tier) => {
        const state: SegmentState =
          tier.level <= obtainedTier
            ? "obtained"
            : tier.level === obtainedTier + 1
              ? "in-progress"
              : "locked";

        return (
          <Box
            key={tier.level}
            data-state={state}
            className={
              state === "obtained"
                ? "h-1.5 flex-1 rounded-full bg-brand"
                : state === "in-progress"
                  ? "h-1.5 flex-1 rounded-full bg-brand/40"
                  : "h-1.5 flex-1 rounded-full bg-paper-4"
            }
          />
        );
      })}
    </Group>
  );
};

export { FeatTierSegments };
