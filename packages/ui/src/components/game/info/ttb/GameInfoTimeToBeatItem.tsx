import { useOnMobile } from "#@/components";
import { Box, Group, HoverCard, Popover, Skeleton, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconClock, IconInfoCircle } from "@tabler/icons-react";

interface Props {
  title: string;
  // Rendered as "not available" if 0
  seconds: number;
  /**
   * Description show on title click (popover).
   */
  description: string;
  isLoading: boolean;
}

const GameInfoTimeToBeatItem = ({
  title,
  seconds,
  description,
  isLoading,
}: Props) => {
  const { t } = useTranslation();
  const onMobile = useOnMobile();
  const renderedValue =
    seconds === 0
      ? t("game.ttb.notAvailable")
      : t("game.ttb.hours", { count: Math.ceil(seconds / 3600) });

  const TargetDescriptionElement = onMobile ? Popover : HoverCard;

  return (
    <Group className={"gap-0.5 flex-nowrap w-full"}>
      <TargetDescriptionElement openDelay={500}>
        <TargetDescriptionElement.Target>
          <Box
            className={
              "border-[var(--gn-dark-8)] border rounded-tl-md rounded-bl-md w-1/2 p-2 "
            }
          >
            <Group className={"gap-1 flex-nowrap w-full justify-center"}>
              <Text className={"text-center"}>{title}</Text>
              <IconInfoCircle size={12} />
            </Group>
          </Box>
        </TargetDescriptionElement.Target>
        <TargetDescriptionElement.Dropdown className={"max-w-40"}>
          <Text className={"text-sm text-wrap"}>{description}</Text>
        </TargetDescriptionElement.Dropdown>
      </TargetDescriptionElement>

      {isLoading ? (
        <Skeleton className={"w-1/2 h-10"} />
      ) : (
        <Group
          className={
            "border-[var(--gn-dark-8)] border rounded-tr-md rounded-br-md bg-paper-5 w-1/2 p-2 gap-1.5 flex-nowrap justify-center"
          }
        >
          {/* Neutral cell with a brand-colored icon: filled brand fills crowd the page. */}
          <IconClock size={14} className={"text-brand shrink-0"} aria-hidden />
          <Text className={"text-center"}>{renderedValue}</Text>
        </Group>
      )}
    </Group>
  );
};

export { GameInfoTimeToBeatItem };
