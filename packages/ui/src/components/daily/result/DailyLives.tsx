import { Divider, Group, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { cn } from "#@/util/cn";

interface Props {
  remaining: number;
  max: number;
  className?: string;
}

/**
 * One heart per attempt; spent hearts are outlined, on the right.
 */
const DailyLives = ({ remaining, max, className }: Props) => {
  const { t } = useTranslation();

  return (
    <Group className={cn("gap-3", className)}>
      <Group className={"gap-1"} aria-hidden>
        {Array.from({ length: max }, (_, index) =>
          index < remaining ? (
            <IconHeartFilled key={index} size={18} className={"text-brand-5"} />
          ) : (
            <IconHeart key={index} size={18} className={"text-dimmed"} />
          ),
        )}
      </Group>
      <Divider orientation={"vertical"} h={16} className={"self-center"} />
      <Text fz={13} fw={500} c={"dimmed"}>
        {t(remaining === 1 ? "daily.livesOne" : "daily.lives", {
          count: remaining,
        })}
      </Text>
    </Group>
  );
};

export { DailyLives };
