import { RECAP_COLORS } from "#@/components/wrapped/card/recapCardTheme";
import {
  RECAP_ACCENTS,
  type RecapAccent,
  type RecapCustomization,
  type RecapExtraStat,
} from "#@/components/wrapped/card/recapCustomization";
import { RECAP_CAPTION_PROPS } from "#@/components/wrapped/recapControlStyles";
import {
  ColorSwatch,
  Group,
  SegmentedControl,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  value: RecapCustomization;
  onChange: (next: RecapCustomization) => void;
}

const EXTRA_STATS: RecapExtraStat[] = ["finished", "reviewed", "started"];

/**
 * Appearance (accent color) and data (the optional figures) of the summary
 * cards. The background has its own control, `RecapBackgroundControl`.
 */
export function RecapCustomizePanel({ value, onChange }: Props) {
  const { t } = useTranslation();
  const update = (patch: Partial<RecapCustomization>) =>
    onChange({ ...value, ...patch });

  return (
    <Stack gap={"xl"} data-testid={"recap-customize"}>
      <Stack gap={"sm"}>
        <Text {...RECAP_CAPTION_PROPS}>
          {t("mobile.wrapped.custom.appearance")}
        </Text>
        <Text size={"sm"} fw={500}>
          {t("mobile.wrapped.custom.accent")}
        </Text>
        <Group gap={"sm"}>
          {(Object.keys(RECAP_ACCENTS) as RecapAccent[]).map((key) => (
            <ColorSwatch
              key={key}
              component={"button"}
              type={"button"}
              color={RECAP_ACCENTS[key]}
              size={32}
              aria-label={t(`mobile.wrapped.custom.accents.${key}`)}
              aria-pressed={value.accent === key}
              data-testid={`recap-accent-${key}`}
              style={{
                cursor: "pointer",
                outline:
                  value.accent === key
                    ? `2px solid ${RECAP_COLORS.cream}`
                    : "2px solid transparent",
                outlineOffset: 2,
              }}
              onClick={() => update({ accent: key })}
            />
          ))}
        </Group>
      </Stack>

      <Stack gap={"sm"}>
        <Text {...RECAP_CAPTION_PROPS}>{t("mobile.wrapped.custom.data")}</Text>
        <Text size={"sm"} fw={500}>
          {t("mobile.wrapped.custom.extraStat")}
        </Text>
        <SegmentedControl
          fullWidth
          size={"xs"}
          data={EXTRA_STATS.map((kind) => ({
            value: kind,
            label: t(`mobile.wrapped.custom.extra.${kind}`),
          }))}
          value={value.extraStat}
          onChange={(next) => update({ extraStat: next as RecapExtraStat })}
        />
        <Switch
          mt={"xs"}
          label={t("mobile.wrapped.custom.showComparison")}
          checked={value.showComparison}
          onChange={(event) =>
            update({ showComparison: event.currentTarget.checked })
          }
        />
      </Stack>
    </Stack>
  );
}
