import React, { useMemo } from "react";
import {
  ComboboxItem,
  LoadingOverlay,
  MultiSelect,
  MultiSelectProps,
  SelectProps,
} from "@mantine/core";
import { Game } from "@repo/wrapper/server";
import { UseQueryResult } from "@tanstack/react-query";
import { useGamesResource } from "@repo/ui";

interface Props extends MultiSelectProps {
  resourceName: string;
}

interface GameResource {
  id: number;
  name: string;
}

const ExploreScreenResourceSelector = ({ resourceName, ...others }: Props) => {
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
      placeholder={resourceQuery.isLoading ? "Loading..." : undefined}
      data={data}
      searchable
      clearable
      {...others}
      maxValues={5}
    ></MultiSelect>
  );
};

export default ExploreScreenResourceSelector;
