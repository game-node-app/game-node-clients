import { useState } from "react";
import {
  AspectRatio,
  Group,
  Image,
  Stack,
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
}

/**
 * Remount it with `key={tokens.length}` so a new level is shown when it arrives.
 */
const DailyImageHint = ({ tokens, ratio = 3 / 4 }: Props) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(tokens.length - 1);
  if (tokens.length === 0) return null;
  const token = tokens[selected];

  return (
    <Stack className={"w-full items-center p-3 rounded-md bg-paper-2"}>
      <AspectRatio
        ratio={ratio}
        className={"w-full"}
        maw={ratio < 1 ? 360 : undefined}
      >
        <Image
          src={getDailyImageUrl(token)}
          alt={t("daily.hint.imageLevel", { level: selected + 1 })}
          fit={"contain"}
          radius={"sm"}
        />
      </AspectRatio>
      {tokens.length > 1 && (
        <Group className={"justify-center gap-2"}>
          {tokens.map((item, index) => (
            <UnstyledButton
              key={item}
              onClick={() => setSelected(index)}
              aria-label={t("daily.hint.imageLevel", { level: index + 1 })}
              aria-pressed={index === selected}
              className={cn("rounded-sm opacity-60", {
                "ring-2 ring-brand-5 opacity-100": index === selected,
              })}
            >
              <Image
                src={getDailyImageUrl(item)}
                alt={""}
                w={48}
                h={48}
                fit={"cover"}
                radius={"xs"}
              />
            </UnstyledButton>
          ))}
        </Group>
      )}
    </Stack>
  );
};

export { DailyImageHint };
