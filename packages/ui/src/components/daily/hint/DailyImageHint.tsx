import { useState } from "react";
import { Group, Image, Stack, UnstyledButton } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { getDailyImageUrl } from "#@/util/getServerStoredImages";
import { cn } from "#@/util/cn";

interface Props {
  /** From the most pixelated level up; the last one is the current level. */
  tokens: string[];
}

/**
 * Remount it with `key={tokens.length}` so a new level is shown when it arrives.
 */
const DailyImageHint = ({ tokens }: Props) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(tokens.length - 1);
  if (tokens.length === 0) return null;

  return (
    <Stack className={"w-full items-center"}>
      <Image
        src={getDailyImageUrl(tokens[selected])}
        alt={t("daily.hint.imageLevel", { level: selected + 1 })}
        fit={"contain"}
        mah={420}
        radius={"sm"}
      />
      {tokens.length > 1 && (
        <Group className={"justify-center gap-2"}>
          {tokens.map((token, index) => (
            <UnstyledButton
              key={token}
              onClick={() => setSelected(index)}
              aria-label={t("daily.hint.imageLevel", { level: index + 1 })}
              aria-pressed={index === selected}
              className={cn("rounded-sm border-2 border-transparent", {
                "border-white": index === selected,
              })}
            >
              <Image
                src={getDailyImageUrl(token)}
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
