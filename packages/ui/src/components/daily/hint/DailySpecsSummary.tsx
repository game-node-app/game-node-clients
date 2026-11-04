import { Button, Group, SimpleGrid, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { DailyPlayResponseDto } from "@repo/wrapper/server";
import { DailyInfoTile } from "#@/components/daily/view/DailyInfoTile";
import { ActionConfirm } from "#@/components/general/ActionConfirm";

interface Props {
  play: DailyPlayResponseDto;
  onUseHint: () => void;
  disabled?: boolean;
}

const DailySpecsSummary = ({ play, onUseHint, disabled }: Props) => {
  const { t } = useTranslation();
  const [confirmOpened, confirm] = useDisclosure();
  const { yearRange, reveal } = play.hints;
  const canUseHint = play.hintAvailable && play.status === "in_progress";

  return (
    <Stack className={"w-full gap-2"}>
      {(yearRange || reveal) && (
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          {yearRange && (
            <DailyInfoTile
              label={t("daily.specs.yearRange")}
              value={`${yearRange.min} – ${yearRange.max}`}
            />
          )}
          {reveal && (
            <DailyInfoTile
              label={t("daily.specs.reveal", {
                column: t(`daily.specs.columns.${reveal.column}`),
              })}
              value={reveal.values.join(", ") || "—"}
            />
          )}
        </SimpleGrid>
      )}
      {canUseHint && (
        <Group>
          <Button variant={"light"} onClick={confirm.open} disabled={disabled}>
            {t("daily.specs.hint")}
          </Button>
        </Group>
      )}
      <ActionConfirm
        opened={confirmOpened}
        onClose={confirm.close}
        title={t("daily.specs.hint")}
        message={t("daily.specs.hintConfirm")}
        onConfirm={onUseHint}
      />
    </Stack>
  );
};

export { DailySpecsSummary };
