import { useState } from "react";
import {
  AspectRatio,
  Group,
  Image,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { getDailyImageUrl } from "#@/util/getServerStoredImages";
import { cn } from "#@/util/cn";

interface Props {
  /** From the most pixelated level up; the last one is the current level. */
  tokens: string[];
  /** Fixed, so the panel keeps its height between levels. */
  ratio?: number;
  /** Total levels the image can reach, for the level bar. */
  levels?: number;
  /** Covers the lower part of a cover, where the game's title usually is. */
  maskTitle?: boolean;
}

/**
 * Remount it with `key={tokens.length}` so a new level is shown when it arrives.
 */
const DailyImageHint = ({
  tokens,
  ratio = 3 / 4,
  levels = 6,
  maskTitle,
}: Props) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(tokens.length - 1);
  if (tokens.length === 0) return null;
  const token = tokens[selected];

  return (
    <Stack className={"w-full items-center gap-3"}>
      <AspectRatio
        ratio={ratio}
        className={
          "relative w-full overflow-hidden rounded-[12px] border border-[var(--mantine-color-default-border)]"
        }
        maw={ratio < 1 ? 300 : undefined}
      >
        <Image
          src={getDailyImageUrl(token)}
          alt={t("daily.hint.imageLevel", { level: selected + 1 })}
          fit={"cover"}
        />
        {maskTitle && (
          <div
            className={
              "!absolute inset-x-0 bottom-0 !top-auto flex !h-[45%] items-center justify-center bg-paper-7"
            }
          >
            <Text fz={12} fw={700} c={"dimmed"} lts={"0.12em"}>
              {t("daily.hint.titleHidden")}
            </Text>
          </div>
        )}
      </AspectRatio>
      <Group className={"gap-2 justify-center"}>
        <Text fz={12} c={"dimmed"}>
          {t("daily.hint.level")}
        </Text>
        <Group className={"gap-1.5"}>
          {Array.from({ length: levels }, (_, index) =>
            index < tokens.length ? (
              // Revealed levels stay reachable, to compare them.
              <UnstyledButton
                key={index}
                onClick={() => setSelected(index)}
                aria-label={t("daily.hint.imageLevel", { level: index + 1 })}
                aria-pressed={index === selected}
                className={cn("h-1 w-[18px] rounded-sm bg-brand-5", {
                  "opacity-40": index !== selected,
                })}
              />
            ) : (
              <span
                key={index}
                aria-hidden
                className={"h-1 w-[18px] rounded-sm bg-paper-4"}
              />
            ),
          )}
        </Group>
        <Text fz={12} fw={600} c={"dimmed"} className={"tabular-nums"}>
          {t("daily.hint.levelOf", { level: selected + 1, total: levels })}
        </Text>
      </Group>
    </Stack>
  );
};

export { DailyImageHint };
