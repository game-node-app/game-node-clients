import { ActionIcon, Button, Drawer, Indicator, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTranslation } from "@repo/locales";
import { GameRankingCriteriaDto } from "@repo/wrapper/server";
import { IconAdjustments } from "@tabler/icons-react";
import { Controller, useForm } from "react-hook-form";
import ExploreScreenResourceSelector from "./ExploreScreenResourceSelector";

const RESOURCES = [
  { resource: "genres", label: "explore.filters.genres" },
  { resource: "platforms", label: "explore.filters.platforms" },
  { resource: "themes", label: "explore.filters.themes" },
  { resource: "gameModes", label: "explore.filters.modes" },
] as const;

type FilterFormValues = Record<
  (typeof RESOURCES)[number]["resource"],
  string[]
>;

interface Props {
  criteria: GameRankingCriteriaDto | undefined;
  /** `undefined` clears every filter and goes back to the shelves. */
  onApply: (criteria: GameRankingCriteriaDto | undefined) => void;
}

/** Mounted with the drawer, so every opening starts from the applied filters. */
const ExploreScreenFiltersForm = ({ criteria, onApply }: Props) => {
  const { t } = useTranslation();
  const { handleSubmit, control } = useForm<FilterFormValues>({
    defaultValues: {
      genres: criteria?.genres?.map(String) ?? [],
      platforms: criteria?.platforms?.map(String) ?? [],
      themes: criteria?.themes?.map(String) ?? [],
      gameModes: criteria?.gameModes?.map(String) ?? [],
    },
  });

  const onSubmit = (data: FilterFormValues) => {
    // criteria without a selector here (ids, status, category) are kept
    const next: GameRankingCriteriaDto = { ...criteria };
    for (const { resource } of RESOURCES) {
      if (data[resource].length) next[resource] = data[resource].map(Number);
      else delete next[resource];
    }
    onApply(Object.keys(next).length ? next : undefined);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        {RESOURCES.map(({ resource, label }) => (
          <Controller
            key={resource}
            control={control}
            name={resource}
            render={({ field }) => (
              <ExploreScreenResourceSelector
                label={t(label)}
                resourceName={resource}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        ))}
        <Button type={"submit"} mt={"md"}>
          {t("common.search")}
        </Button>
        {criteria && (
          <Button variant={"subtle"} onClick={() => onApply(undefined)}>
            {t("explore.filters.clear")}
          </Button>
        )}
      </Stack>
    </form>
  );
};

/** Web-only filters of the Explore screen, behind a button in the filter row. */
const ExploreScreenFilters = ({ criteria, onApply }: Props) => {
  const { t } = useTranslation();
  const [opened, drawer] = useDisclosure();
  const count = RESOURCES.reduce(
    (total, { resource }) => total + (criteria?.[resource]?.length ?? 0),
    0,
  );

  return (
    <>
      <Drawer
        opened={opened}
        onClose={drawer.close}
        position={"right"}
        title={t("explore.filters.title")}
      >
        <ExploreScreenFiltersForm
          criteria={criteria}
          onApply={(next) => {
            drawer.close();
            onApply(next);
          }}
        />
      </Drawer>
      <Indicator label={count} size={16} disabled={count === 0}>
        <ActionIcon
          variant={"default"}
          radius={"xl"}
          size={"md"}
          aria-label={t("explore.filters.title")}
          onClick={drawer.open}
        >
          <IconAdjustments size={18} />
        </ActionIcon>
      </Indicator>
    </>
  );
};

export default ExploreScreenFilters;
