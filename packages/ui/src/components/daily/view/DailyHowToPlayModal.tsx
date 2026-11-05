import { Fragment } from "react";
import { Button, Group, Image, Stack, Text } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { IconArrowRight } from "@tabler/icons-react";
import { DailyMatchTag } from "#@/components/daily/guess/DailyMatchTag";
import { DailyLives } from "#@/components/daily/result/DailyLives";
import { Modal } from "#@/util/modal";

interface Props {
  opened: boolean;
  onClose: () => void;
}

/** Three levels of one illustrative cover, from the most to the least pixelated. */
const PROGRESSION = ["s0", "s2", "s4"];
const FRANCHISE_LEVELS = ["none", "partial", "match"] as const;
const TRAIT_LEVELS = ["match", "partial", "none"] as const;

const SectionLabel = ({ children }: { children: string }) => (
  <Text fz={12} fw={600} c={"dimmed"} tt={"uppercase"} lts={"0.08em"}>
    {children}
  </Text>
);

const DailyHowToPlayModal = ({ opened, onClose }: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t("daily.howToPlay.title")}
      size={560}
      radius={16}
      padding={28}
      centered
      classNames={{ title: "text-2xl font-bold" }}
    >
      <Stack className={"gap-[18px]"}>
        <Text fz={14} c={"dimmed"}>
          {t("daily.howToPlay.intro")}
        </Text>
        <Group className={"justify-center gap-2.5"} aria-hidden>
          {PROGRESSION.map((step, index) => (
            <Fragment key={step}>
              {index > 0 && (
                <IconArrowRight size={16} className={"text-dimmed"} />
              )}
              {/* The title strip mirrors the mask on the real Cover hint. */}
              <div
                className={
                  "relative h-[112px] w-[84px] overflow-hidden rounded-[12px] border border-[var(--mantine-color-default-border)]"
                }
              >
                <Image
                  src={`/img/daily/how-to-play-${step}.jpg`}
                  alt={""}
                  className={"size-full object-cover"}
                />
                <div
                  className={
                    "absolute inset-x-0 top-[59px] h-[52px] bg-paper-7"
                  }
                />
              </div>
            </Fragment>
          ))}
        </Group>

        <SectionLabel>{t("daily.howToPlay.franchiseTitle")}</SectionLabel>
        {FRANCHISE_LEVELS.map((level) => (
          <Group key={level} className={"gap-3"}>
            <DailyMatchTag
              match={level}
              label={t(`daily.franchise.${level}`)}
              radius={"sm"}
              size={"lg"}
            />
            <Text fz={13} c={"dimmed"}>
              {t(`daily.howToPlay.franchise.${level}`)}
            </Text>
          </Group>
        ))}

        <SectionLabel>{t("daily.howToPlay.traitsTitle")}</SectionLabel>
        <Group className={"gap-2"}>
          {TRAIT_LEVELS.map((level) => (
            <DailyMatchTag
              key={level}
              match={level}
              label={t(`daily.specs.legend.${level}`)}
              radius={"xl"}
            />
          ))}
        </Group>

        <SectionLabel>{t("daily.howToPlay.livesTitle")}</SectionLabel>
        <DailyLives remaining={6} max={6} />
        <Text fz={13} c={"dimmed"}>
          {t("daily.howToPlay.footer")}
        </Text>
        <Button fullWidth size={"md"} onClick={onClose}>
          {t("daily.howToPlay.confirm")}
        </Button>
      </Stack>
    </Modal>
  );
};

export { DailyHowToPlayModal };
