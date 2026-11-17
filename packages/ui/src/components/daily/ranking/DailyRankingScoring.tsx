import { Collapse, Stack, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { IconChevronDown, IconHelpCircle } from "@tabler/icons-react";
import { Modal } from "#@/util/modal";
import { cn } from "#@/util/cn";

const ATTEMPT_POINTS = [6, 5, 4, 3, 2, 1] as const;

/** The scoring rules: points per attempt, Specs, skips, archive and the bonus. */
const DailyRankingScoringContent = () => {
  const { t } = useTranslation();
  const rows = [
    ...ATTEMPT_POINTS.map((points, index) => ({
      key: `attempt${index + 1}`,
      label: t(
        `daily.ranking.scoring.attempt${index + 1}` as "daily.ranking.scoring.attempt1",
      ),
      value: t(
        points === 1 ? "daily.ranking.pointsOne" : "daily.ranking.points",
        {
          points,
        },
      ),
    })),
    {
      key: "notSolved",
      label: t("daily.ranking.scoring.notSolved"),
      value: t("daily.ranking.scoring.notSolvedPoints"),
    },
  ];

  return (
    <Stack className={"gap-2.5"}>
      <Text fz={13} lh={"19px"} c={"#ADADAD"}>
        {t("daily.ranking.scoring.intro")}
      </Text>
      <dl className={"m-0 flex flex-col gap-2.5"}>
        {rows.map((row) => (
          <div key={row.key} className={"flex items-center justify-between"}>
            <Text component={"dt"} fz={13} c={"#ADADAD"}>
              {row.label}
            </Text>
            <Text
              component={"dd"}
              fz={13}
              fw={700}
              c={"white"}
              className={"m-0"}
            >
              {row.value}
            </Text>
          </div>
        ))}
      </dl>
      <Text fz={13} lh={"19px"} c={"#ADADAD"}>
        {t("daily.ranking.scoring.specs")}
      </Text>
      <Text fz={12} lh={"18px"} className={"text-[#7A7A7A]"}>
        {t("daily.ranking.scoring.footer")}
      </Text>
    </Stack>
  );
};

/**
 * Side card explaining the scoring; the title toggles the rules.
 */
const DailyRankingScoring = ({
  defaultOpened = true,
}: {
  defaultOpened?: boolean;
}) => {
  const { t } = useTranslation();
  const [opened, { toggle }] = useDisclosure(defaultOpened);

  return (
    <div
      className={
        "flex flex-col rounded-[14px] border border-solid border-line bg-paper-8 p-[18px]"
      }
    >
      <UnstyledButton
        onClick={toggle}
        aria-expanded={opened}
        className={"flex items-center gap-2"}
      >
        <IconHelpCircle size={16} className={"text-white"} aria-hidden />
        <Text
          component={"span"}
          fz={15}
          fw={700}
          c={"white"}
          className={"flex-1"}
        >
          {t("daily.ranking.scoring.title")}
        </Text>
        <IconChevronDown
          size={16}
          aria-hidden
          className={cn(
            "text-[#7A7A7A] transition-transform",
            opened && "rotate-180",
          )}
        />
      </UnstyledButton>
      <Collapse expanded={opened}>
        <div className={"pt-2.5"}>
          <DailyRankingScoringContent />
        </div>
      </Collapse>
    </div>
  );
};

const DailyRankingScoringModal = ({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("daily.ranking.scoring.title")}
      size={420}
      radius={16}
      centered
      classNames={{ title: "text-lg font-bold" }}
    >
      <DailyRankingScoringContent />
    </Modal>
  );
};

export {
  DailyRankingScoring,
  DailyRankingScoringContent,
  DailyRankingScoringModal,
};
