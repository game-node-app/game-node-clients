import React, { Dispatch, SetStateAction, useEffect } from "react";
import { z } from "zod";
import {
  FindStatisticsTrendingGamesDto,
  GameRepositoryFilterDto,
} from "@repo/wrapper/server";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ActionIcon,
  Button,
  Center,
  ComboboxItem,
  Drawer,
  Group,
  Select,
  SimpleGrid,
} from "@mantine/core";
import ExploreScreenResourceSelector from "@/components/explore/ExploreScreenResourceSelector";
import { useRouter } from "next/router";
import { IconAdjustments } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import {
  exploreScreenDtoToSearchParams,
  exploreScreenUrlQueryToDto,
} from "@/components/explore/utils";
import { GameResourceFilter } from "@repo/ui";
import { useTranslation } from "@repo/locales";
import period = FindStatisticsTrendingGamesDto.period;

export const DEFAULT_EXPLORE_SCREEN_PERIOD = period.MONTH.valueOf();

const FilterFormSchema = z.object({
  themes: z.array(z.string()).optional(),
  genres: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
  category: z.string().optional(),
  gameModes: z.array(z.string()).optional(),
  status: z.string().optional(),
  period: z.string(),
});

type FilterFormValues = z.infer<typeof FilterFormSchema>;

/**
 * PS: DO NOT use this as 'data' for the MultiSelect component. This is only for reference when building the JSX below.
 */
interface Props {
  onFilterChange: Dispatch<SetStateAction<FindStatisticsTrendingGamesDto>>;
  hasLoadedQueryParams: boolean;
}

const ExploreScreenFilters = ({
  onFilterChange,
  hasLoadedQueryParams,
}: Props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [drawerOpened, drawerUtils] = useDisclosure();

  const SELECT_PERIOD_DATA: ComboboxItem[] = [
    { label: t("explore.periods.week"), value: period.WEEK.valueOf() },
    { label: t("explore.periods.month"), value: period.MONTH.valueOf() },
    {
      label: t("explore.periods.threeMonths"),
      value: period.QUARTER.valueOf(),
    },
    {
      label: t("explore.periods.sixMonths"),
      value: period.HALF_YEAR.valueOf(),
    },
    {
      label: t("explore.periods.year"),
      value: period.YEAR.valueOf(),
    },
    {
      label: t("explore.periods.allTime"),
      value: period.ALL.valueOf(),
    },
  ];

  const resources: GameResourceFilter[] = [
    {
      label: t("explore.filters.themes"),
      resource: "themes",
    },
    {
      label: t("explore.filters.genres"),
      resource: "genres",
    },
    {
      label: t("explore.filters.platforms"),
      resource: "platforms",
    },
    {
      label: t("explore.filters.modes"),
      resource: "gameModes",
    },
  ];

  const { handleSubmit, register, setValue, watch, formState } =
    useForm<FilterFormValues>({
      resolver: zodResolver(FilterFormSchema),
      mode: "onBlur",
      defaultValues: {
        period: DEFAULT_EXPLORE_SCREEN_PERIOD,
      },
    });

  const onSubmit = async (data: FilterFormValues) => {
    const { period, ...criteria } = data;
    onFilterChange((previousState) => {
      const updatedState = {
        ...previousState,
        period: period as period,
        criteria: criteria as GameRepositoryFilterDto,
      };
      const searchParams = exploreScreenDtoToSearchParams(updatedState);
      router.replace(
        {
          query: searchParams.toString(),
        },
        undefined,
        { shallow: false },
      );
      return updatedState;
    });
    drawerUtils.close();
  };

  useEffect(() => {
    const query = router.query;
    if (router.isReady && !hasLoadedQueryParams) {
      const dto = exploreScreenUrlQueryToDto(query);
      if (dto.criteria) {
        for (const [k, v] of Object.entries(dto.criteria)) {
          setValue(k as any, v);
        }
      }
      setValue("period", dto.period);
      onFilterChange((prevState) => ({ ...prevState, ...dto }));
    }
  }, [
    hasLoadedQueryParams,
    router.isReady,
    router.query,
    onFilterChange,
    setValue,
  ]);

  return (
    <Group justify={"space-between"} align={"center"} w={"100%"}>
      <Drawer
        onClose={drawerUtils.close}
        opened={drawerOpened}
        title={t("common.actions")}
      >
        <form className={"w-full h-full"} onSubmit={handleSubmit(onSubmit)}>
          <SimpleGrid cols={2}>
            {resources.map((resourceReference) => {
              const valueName = resourceReference.resource as any;
              return (
                <ExploreScreenResourceSelector
                  label={resourceReference.label}
                  key={valueName}
                  resourceName={valueName}
                  value={watch(valueName)}
                  onChange={(value) => {
                    setValue(valueName, value);
                  }}
                />
              );
            })}
          </SimpleGrid>
          <Center className={"mt-8"}>
            <Button type="submit" loading={formState.isSubmitting}>
              {t("common.search")}
            </Button>
          </Center>
        </form>
      </Drawer>
      <ActionIcon className="mt-4 mb-2" onClick={() => drawerUtils.open()}>
        <IconAdjustments />
      </ActionIcon>
      <Select
        {...register("period")}
        description={t("explore.filters.trendingIn")}
        data={SELECT_PERIOD_DATA}
        value={watch("period")}
        allowDeselect={false}
        onChange={(v) => {
          const value = v ?? period.MONTH.valueOf();
          setValue("period", value);
          onSubmit({ period: v as period });
        }}
      />
    </Group>
  );
};

export default ExploreScreenFilters;
