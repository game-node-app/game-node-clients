import { ComboboxItem, MultiSelect, MultiSelectProps } from "@mantine/core";
import { useTranslation } from "@repo/locales";
import { useGamesResource } from "@repo/ui";
import { Game } from "@repo/wrapper/server";
import { UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";

interface Props extends MultiSelectProps {
  resourceName: string;
}

interface GameResource {
  id: number;
  name: string;
}

const ExploreScreenResourceSelector = ({ resourceName, ...others }: Props) => {
  const { t } = useTranslation();
  const resourceQuery = useGamesResource(
    resourceName as keyof Game,
  ) as unknown as UseQueryResult<GameResource[]>;
  const data = useMemo((): ComboboxItem[] | undefined => {
    if (resourceQuery.data == undefined) return undefined;
    return resourceQuery.data.map((resource) => {
      return {
        value: `${resource.id}`,
        label: resource.name,
      };
    });
  }, [resourceQuery.data]);
  return (
    <MultiSelect
      pos={"relative"}
      placeholder={
        resourceQuery.isLoading ? t("explore.placeholders.loading") : undefined
      }
      data={data}
      searchable
      clearable
      {...others}
      maxValues={5}
    ></MultiSelect>
  );
};

export default ExploreScreenResourceSelector;