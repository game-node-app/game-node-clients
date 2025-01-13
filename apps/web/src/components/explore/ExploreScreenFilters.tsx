import React, {
    Dispatch,
    SetStateAction,
    useEffect,
    useLayoutEffect,
    useRef,
} from "react";
import { z } from "zod";
import {
    FindStatisticsTrendingGamesDto,
    FindStatisticsTrendingReviewsDto,
    GameRepositoryFilterDto,
} from "@/wrapper/server";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    ActionIcon,
    Button,
    Center,
    ComboboxItem,
    Drawer,
    Group,
    LoadingOverlay,
    Select,
    SimpleGrid,
    Stack,
} from "@mantine/core";
import ExploreScreenResourceSelector from "@/components/explore/ExploreScreenResourceSelector";
import { useRouter } from "next/router";
import { IconAdjustments } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { GameResourceFilter } from "@/components/game/util/types";
import {
    exploreScreenDtoToSearchParams,
    exploreScreenUrlQueryToDto,
} from "@/components/explore/utils";
import period = FindStatisticsTrendingGamesDto.period;

export const DEFAULT_EXPLORE_SCREEN_PERIOD = period.MONTH.valueOf();

// @ts-ignore
const FilterFormSchema = z.object({
    themes: z.array(z.string()).optional(),
    genres: z.array(z.string()).optional(),
    platforms: z.array(z.string()).optional(),
    category: z.string().optional(),
    gameModes: z.array(z.string()).optional(),
    status: z.string().optional(),
    period: z.string().default(DEFAULT_EXPLORE_SCREEN_PERIOD),
});

const SELECT_PERIOD_DATA: ComboboxItem[] = [
    { label: "Week", value: period.WEEK.valueOf() },
    { label: "Month", value: period.MONTH.valueOf() },
    {
        label: "3 months",
        value: period.QUARTER.valueOf(),
    },
    {
        label: "6 months",
        value: period.HALF_YEAR.valueOf(),
    },
    {
        label: "Year",
        value: period.YEAR.valueOf(),
    },
    {
        label: "All time",
        value: period.ALL.valueOf(),
    },
];

type FilterFormValues = z.infer<typeof FilterFormSchema>;

/**
 * PS: DO NOT use this as 'data' for the MultiSelect component. This is only for reference when building the JSX below.
 */
const resources: GameResourceFilter[] = [
    {
        label: "Themes",
        resource: "themes",
    },
    {
        label: "Genres",
        resource: "genres",
    },
    {
        label: "Platforms",
        resource: "platforms",
    },
    {
        label: "Modes",
        resource: "gameModes",
    },
];

interface Props {
    onFilterChange: Dispatch<SetStateAction<FindStatisticsTrendingGamesDto>>;
    hasLoadedQueryParams: boolean;
}

const ExploreScreenFilters = ({
    onFilterChange,
    hasLoadedQueryParams,
}: Props) => {
    const router = useRouter();
    const [drawerOpened, drawerUtils] = useDisclosure();

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
                title={"Filters"}
            >
                <form
                    className={"w-full h-full"}
                    onSubmit={handleSubmit(onSubmit)}
                >
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
                            Filter
                        </Button>
                    </Center>
                </form>
            </Drawer>
            <ActionIcon
                className="mt-4 mb-2"
                onClick={() => drawerUtils.open()}
            >
                <IconAdjustments />
            </ActionIcon>
            <Select
                {...register("period")}
                description={"Trending in"}
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
