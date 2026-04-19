import { GameRating } from "#@/components/general/input/GameRating";
import { useReviewsScore } from "#@/components/review/hooks/useReviewsScore";
import {
  Center,
  Divider,
  Group,
  HoverCard,
  Popover,
  Stack,
  Text,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconStar } from "@tabler/icons-react";
import { useMemo } from "react";
import { DetailsCard, useOnMobile } from "#@/components";

interface Props {
  gameId: number;
}

const GameInfoScore = ({ gameId }: Props) => {
  const onMobile = useOnMobile();
  const { t } = useTranslation();
  const score = useReviewsScore(gameId);
  const scoreDistribution = useMemo(() => {
    if (score.data == undefined || score.data.distribution == undefined)
      return <Text fz={"sm"}>{t("game.messages.notEnoughReviews")}</Text>;

    return Object.entries(score.data.distribution)
      .toReversed()
      .map(([k, v], index, arr) => {
        if (k === "total") return null;
        const total = score.data.distribution.total;
        const percentage = (v / total) * 100;
        const percentageToUse = Number.isNaN(percentage)
          ? 0
          : Math.trunc(percentage);
        const lastElement = index + 1 === arr.length;
        return (
          <Stack
            key={k}
            miw={{
              base: "50vw",
              lg: "10vw",
            }}
          >
            <Group justify={"space-between"} w={"100%"}>
              <Group gap={0}>
                <Text fz={"sm"}>{k}</Text>
                <Text fz={"sm"}>
                  <IconStar size={"0.8rem"} />
                </Text>
              </Group>

              <Text fz={"sm"}>{percentageToUse}%</Text>
            </Group>
            {!lastElement && <Divider />}
          </Stack>
        );
      });
  }, [score.data, t]);

  const TargetPopoverElement = onMobile ? Popover : HoverCard;

  return (
    <DetailsCard title={t("game.labels.userRating")}>
      <TargetPopoverElement>
        <TargetPopoverElement.Target>
          <Center className={"mt-6 mb-6"}>
            <GameRating value={score.data?.median} />
          </Center>
        </TargetPopoverElement.Target>
        <TargetPopoverElement.Dropdown>
          <Stack>{scoreDistribution}</Stack>
        </TargetPopoverElement.Dropdown>
      </TargetPopoverElement>
    </DetailsCard>
  );
};

export { GameInfoScore };
