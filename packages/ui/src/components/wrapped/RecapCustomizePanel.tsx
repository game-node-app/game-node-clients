import {
  DEFAULT_RECAP_CUSTOMIZATION,
  RECAP_ACCENTS,
  type RecapAccent,
  type RecapCustomization,
  type RecapExtraStat,
} from "#@/components/wrapped/card/recapCustomization";
import {
  Button,
  ColorSwatch,
  Group,
  SegmentedControl,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
} from "@mantine/core";
import { useTranslation } from "@repo/locales";

interface Props {
  value: RecapCustomization;
  onChange: (next: RecapCustomization) => void;
  /** Games that can provide the backdrop art, in ranking order. */
  games: { id: number; name: string }[];
  /** The template draws game art, so the art controls apply. */
  hasBackdrop: boolean;
  /** Art opacity the template uses until the user moves the slider. */
  defaultOpacity: number;
}

const AUTO = "auto";
const EXTRA_STATS: RecapExtraStat[] = ["finished", "reviewed", "started"];

const captionProps = {
  size: "xs",
  fw: 700,
  tt: "uppercase",
  c: "dimmed",
  lts: 1,
} as const;

/** Controls for the art, accent and optional figures of the summary cards. */
export function RecapCustomizePanel({
  value,
  onChange,
  games,
  hasBackdrop,
  defaultOpacity,
}: Props) {
  const { t } = useTranslation();
  const update = (patch: Partial<RecapCustomization>) =>
    onChange({ ...value, ...patch });
  const opacity = value.backdropOpacity ?? defaultOpacity;

  return (
    <Stack gap={"md"} data-testid={"recap-customize"}>
      <Text {...captionProps}>{t("mobile.wrapped.custom.title")}</Text>

      {hasBackdrop && (
        <>
          <Select
            label={t("mobile.wrapped.custom.backdropGame")}
            allowDeselect={false}
            data={[
              { value: AUTO, label: t("mobile.wrapped.custom.backdropAuto") },
              ...games.map((game) => ({
                value: `${game.id}`,
                label: game.name,
              })),
            ]}
            value={
              value.backdropGameId == null ? AUTO : `${value.backdropGameId}`
            }
            onChange={(next) =>
              update({
                backdropGameId:
                  next == null || next === AUTO ? null : Number(next),
              })
            }
          />
          <Stack gap={6}>
            <Group justify={"space-between"}>
              <Text size={"sm"} fw={500}>
                {t("mobile.wrapped.custom.opacity")}
              </Text>
              <Text size={"sm"} c={"dimmed"}>
                {Math.round(opacity * 100)}%
              </Text>
            </Group>
            <Slider
              min={0}
              max={100}
              step={1}
              value={Math.round(opacity * 100)}
              label={null}
              aria-label={t("mobile.wrapped.custom.opacity")}
              onChange={(next) => update({ backdropOpacity: next / 100 })}
            />
            {value.backdropOpacity != null && (
              <Button
                variant={"subtle"}
                size={"compact-xs"}
                className={"self-start"}
                onClick={() => update({ backdropOpacity: null })}
              >
                {t("mobile.wrapped.custom.resetOpacity")}
              </Button>
            )}
          </Stack>
        </>
      )}

      <Stack gap={6}>
        <Text size={"sm"} fw={500}>
          {t("mobile.wrapped.custom.accent")}
        </Text>
        <Group gap={"xs"}>
          {(Object.keys(RECAP_ACCENTS) as RecapAccent[]).map((key) => (
            <ColorSwatch
              key={key}
              component={"button"}
              type={"button"}
              color={RECAP_ACCENTS[key]}
              size={28}
              aria-label={t(`mobile.wrapped.custom.accents.${key}`)}
              aria-pressed={value.accent === key}
              data-testid={`recap-accent-${key}`}
              style={{
                cursor: "pointer",
                outline:
                  value.accent === key
                    ? "2px solid #F4EFE8"
                    : "2px solid transparent",
                outlineOffset: 2,
              }}
              onClick={() => update({ accent: key })}
            />
          ))}
        </Group>
      </Stack>

      <Stack gap={6}>
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
      </Stack>

      <Switch
        label={t("mobile.wrapped.custom.showComparison")}
        checked={value.showComparison}
        onChange={(event) =>
          update({ showComparison: event.currentTarget.checked })
        }
      />

      <Button
        variant={"subtle"}
        size={"compact-sm"}
        className={"self-start"}
        onClick={() => onChange(DEFAULT_RECAP_CUSTOMIZATION)}
      >
        {t("mobile.wrapped.custom.reset")}
      </Button>
    </Stack>
  );
}
