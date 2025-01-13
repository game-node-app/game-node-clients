import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Flex, Space, Stack, Text } from "@mantine/core";
import SearchBar from "@/components/general/input/SearchBar/SearchBar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GameSearchResultView from "@/components/game/search/GameSearchResultView";
import { GameSearchRequestDto } from "@/components/game/search/utils/types";
import useSearchGames from "@/components/game/hooks/useSearchGames";
import TrendingGamesList from "@/components/game/trending/TrendingGamesList";
import { ParsedUrlQuery } from "querystring";
import TrendingReviewCarousel from "@/components/review/trending/TrendingReviewCarousel";
import { useRouter } from "next/router";
import { DetailsBox } from "@/components/general/DetailsBox";
import RecentActivityList from "@/components/activity/RecentActivityList";
import GameSearchTips from "@/components/game/search/GameSearchTips";
import useUserId from "@/components/auth/hooks/useUserId";
import RecommendationCarousel from "@/components/recommendation/carousel/RecommendationCarousel";

const SearchFormSchema = z.object({
    query: z.string().min(3),
    page: z.number().min(1).optional().default(1),
});

type TSearchFormValues = z.infer<typeof SearchFormSchema>;

const DEFAULT_SEARCH_PARAMETERS: GameSearchRequestDto = {
    query: undefined,
    page: 1,
    limit: 20,
};

const urlQueryToDto = (urlQuery: ParsedUrlQuery) => {
    const searchParams = DEFAULT_SEARCH_PARAMETERS;
    const { query, page } = urlQuery;
    if (query) {
        searchParams.query = query as string;
    }
    if (page) {
        searchParams.page = Number.parseInt(page as string, 10);
    }

    return searchParams;
};

const queryDtoToSearchParams = (dto: GameSearchRequestDto) => {
    const params = new URLSearchParams();
    const { query, page } = dto;
    if (query) params.set("query", query);
    if (page) params.set("page", `${page}`);
    return params;
};

const Index = () => {
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<TSearchFormValues>({
        resolver: zodResolver(SearchFormSchema),
        mode: "onBlur",
    });

    const userId = useUserId();

    const router = useRouter();
    const query = router.query;

    const [searchParameters, setSearchParameters] = useState(
        DEFAULT_SEARCH_PARAMETERS,
    );

    const isQueryEnabled =
        searchParameters.query != undefined &&
        searchParameters.query.length > 2 &&
        searchParameters.page != undefined &&
        searchParameters.page > 0;

    const hasSetQueryParams = useRef(false);

    const searchQuery = useSearchGames(searchParameters, isQueryEnabled);

    const onSubmit = (data: TSearchFormValues) => {
        data.page = data.page || 1;
        const searchParams = queryDtoToSearchParams(data);
        router.replace({
            query: searchParams.toString(),
        });
        setSearchParameters((previous) => ({
            ...previous,
            ...data,
        }));
    };

    /**
     * Trending games, reviews, etc.
     */
    const extraItemsEnabled =
        !searchQuery.isLoading &&
        !searchQuery.isError &&
        searchQuery.data == undefined;

    useEffect(() => {
        if (hasSetQueryParams.current) return;
        if (router.isReady) {
            const dto = urlQueryToDto(query);
            if (dto.query) setValue("query", dto.query);
            if (dto.page) setValue("page", dto.page);
            setSearchParameters((params) => ({
                ...params,
                dto,
            }));
            hasSetQueryParams.current = true;
        }
    }, [isQueryEnabled, query, router.isReady, setValue]);

    return (
        <Container fluid mih={"100%"} pos={"relative"} className="mb-12">
            <Stack align="center" justify="center" w={"100%"}>
                <Box
                    className={`w-full flex justify-center h-full lg:max-w-screen-lg mt-12 flex-wrap`}
                >
                    <form
                        className="w-full h-full"
                        onSubmit={handleSubmit((data) => {
                            setValue("page", 1);
                            onSubmit(data);
                        })}
                    >
                        <SearchBar
                            label={"Search for games"}
                            withButton
                            error={errors.query?.message}
                            value={watch("query")}
                            onChange={(e) => {
                                setValue("query", e.target.value);
                            }}
                        />
                    </form>
                    <Box className={"w-full mt-2"}>
                        <Text className={"text-start text-xs text-dimmed"}>
                            The GameNode team wishes you a happy new year!
                            Thanks for staying with us through 2024.
                        </Text>
                    </Box>

                    {/*<GameSearchTips className={"w-full mt-2"} />*/}
                </Box>
                <Box
                    className={
                        "w-full flex justify-center h-full lg:max-w-screen-lg"
                    }
                >
                    <GameSearchResultView
                        enabled={isQueryEnabled}
                        isError={searchQuery.isError}
                        error={searchQuery.error}
                        isLoading={searchQuery.isLoading}
                        results={searchQuery.data?.data?.items}
                        page={watch("page")}
                        paginationInfo={searchQuery.data?.pagination}
                        onPaginationChange={(page) => {
                            setValue("page", page);
                            handleSubmit(onSubmit)();
                        }}
                    />
                    {extraItemsEnabled && (
                        <Stack
                            w={"100%"}
                            h={"100%"}
                            justify={"center"}
                            align={"center"}
                            mt={"1rem"}
                        >
                            <TrendingGamesList />
                            <Space h={"1rem"} />
                            {userId && (
                                <>
                                    <RecommendationCarousel
                                        criteria="finished"
                                        stackProps={{
                                            className: "",
                                        }}
                                    />
                                    <RecommendationCarousel
                                        criteria="theme"
                                        stackProps={{
                                            className: "",
                                        }}
                                    />
                                    <RecommendationCarousel
                                        criteria="genre"
                                        stackProps={{
                                            className: "",
                                        }}
                                    />
                                </>
                            )}
                            <Space h={"1rem"} />
                            <TrendingReviewCarousel />
                            <Space h={"1rem"} />
                            <DetailsBox
                                title={"Recent Activity"}
                                stackProps={{
                                    className: "",
                                }}
                            >
                                <RecentActivityList />
                            </DetailsBox>
                        </Stack>
                    )}
                </Box>
            </Stack>
        </Container>
    );
};

export default Index;
