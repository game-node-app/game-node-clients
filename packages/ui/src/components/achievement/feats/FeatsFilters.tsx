import { useTranslation } from "@repo/locales";
import { AchievementV2Dto } from "@repo/wrapper/server";
import {
  Button,
  Flex,
  Group,
  SegmentedControl,
  TextInput,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import {
  formatFeatNumber,
  type FeatsCategoryFilter,
  type FeatsStatusFilter,
} from "../util/feats";

export interface FeatsFiltersValue {
  category: FeatsCategoryFilter;
  query: string;
  status: FeatsStatusFilter;
}

export interface FeatsFiltersProps extends FeatsFiltersValue {
  /** Visible catalog size, shown next to "All". */
  total: number;
  onChange: (value: FeatsFiltersValue) => void;
}

/**
 * Controlled filters of the Feats page: category chips, text search and status.
 */
const FeatsFilters = ({
  category,
  query,
  status,
  total,
  onChange,
}: FeatsFiltersProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n?.resolvedLanguage || i18n?.language;

  const categories: { value: FeatsCategoryFilter; label: string }[] = [
    { value: "all", label: t("achievements.filters.categories.all") },
    {
      value: AchievementV2Dto.category._0,
      label: t("achievements.filters.categories.collection"),
    },
    {
      value: AchievementV2Dto.category._1,
      label: t("achievements.filters.categories.followers"),
    },
    {
      value: AchievementV2Dto.category._2,
      label: t("achievements.filters.categories.reviews"),
    },
    {
      value: AchievementV2Dto.category._3,
      label: t("achievements.filters.categories.comments"),
    },
    {
      value: AchievementV2Dto.category._4,
      label: t("achievements.filters.categories.specials"),
    },
    {
      value: AchievementV2Dto.category._5,
      label: t("achievements.filters.categories.events"),
    },
  ];

  const statusOptions = [
    { value: "all", label: t("achievements.filters.status.all") },
    { value: "obtained", label: t("achievements.filters.status.obtained") },
    { value: "locked", label: t("achievements.filters.status.locked") },
  ];

  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      gap={12}
      align={{ base: "stretch", lg: "center" }}
      justify={"space-between"}
      className={"w-full border-b border-paper-6 pb-4"}
    >
      <Group
        gap={6}
        wrap={"nowrap"}
        className={"w-full min-w-0 overflow-x-auto pb-0.5 lg:w-auto"}
      >
        {categories.map((option) => {
          const active = option.value === category;

          return (
            <Button
              key={`${option.value}`}
              variant={active ? "white" : "default"}
              radius={"xl"}
              size={"sm"}
              px={12}
              onClick={() =>
                onChange({ category: option.value, query, status })
              }
              aria-pressed={active}
              className={"shrink-0 font-semibold"}
            >
              {option.label}
              {option.value === "all" && (
                <span className={"ml-1.5 text-xs opacity-75"}>
                  {formatFeatNumber(total, locale)}
                </span>
              )}
            </Button>
          );
        })}
      </Group>

      <Flex
        gap={10}
        direction={{ base: "column", sm: "row" }}
        justify={"space-between"}
        align={{ base: "stretch", sm: "center" }}
        className={"shrink-0"}
      >
        <TextInput
          value={query}
          onChange={(event) =>
            onChange({ category, query: event.currentTarget.value, status })
          }
          placeholder={t("achievements.filters.searchPlaceholder")}
          aria-label={t("achievements.filters.searchPlaceholder")}
          leftSection={<IconSearch size={18} />}
          leftSectionPointerEvents={"none"}
          radius={"md"}
          className={"w-full sm:max-w-[240px] lg:w-[200px]"}
        />

        <SegmentedControl
          value={status}
          onChange={(value) =>
            onChange({
              category,
              query,
              status: value as FeatsStatusFilter,
            })
          }
          data={statusOptions}
          radius={"md"}
          size={"xs"}
          className={"w-full sm:w-auto"}
        />
      </Flex>
    </Flex>
  );
};

export { FeatsFilters };
