import { Button, Group, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { DailyPlayResponseDto } from "@repo/wrapper/server";
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
      {yearRange && (
        <Text>
          {t("daily.specs.yearRange", {
            min: yearRange.min,
            max: yearRange.max,
          })}
        </Text>
      )}
      {reveal && (
        <Text>
          {t("daily.specs.reveal", {
            column: t(`daily.specs.columns.${reveal.column}`),
            values: reveal.values.join(", ") || "—",
          })}
        </Text>
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
