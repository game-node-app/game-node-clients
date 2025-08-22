import React, { useRef, useState } from "react";
import { games_GameSearchRequestDto } from "@repo/wrapper/search";
import { Chip, Group } from "@mantine/core";
import { z } from "zod";
import { FieldPath, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const SearchRequestFiltersSchema = z.object({
  includeDlcs: z.boolean().default(false),
  includeExtraContent: z.boolean().default(false),
});

type SearchRequestFiltersValues = z.infer<typeof SearchRequestFiltersSchema>;

interface Props {
  onChange: (data: SearchRequestFiltersValues) => void;
}

const GameSearchFilters = ({ onChange }: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { watch, setValue, handleSubmit, register } =
    useForm<SearchRequestFiltersValues>({
      mode: "onSubmit",
      resolver: zodResolver(SearchRequestFiltersSchema),
      defaultValues: {
        includeDlcs: false,
        includeExtraContent: false,
      },
    });

  const registerChip = (fieldName: FieldPath<SearchRequestFiltersValues>) => {
    return {
      ...register(fieldName),
      checked: watch(fieldName) as boolean,
      onChange: (v: boolean) => {
        setValue(fieldName, v);
        formRef.current?.requestSubmit();
      },
    } as const;
  };

  return (
    <form className={"w-full"} ref={formRef} onSubmit={handleSubmit(onChange)}>
      <Group className={"w-full flex-nowrap gap-sm overflow-x-auto pb-2"}>
        <Chip {...registerChip("includeDlcs")}>Include DLCs/Expansions</Chip>
        <Chip {...registerChip("includeExtraContent")}>
          Include Bundles/Updates/Extra
        </Chip>
      </Group>
    </form>
  );
};

export { GameSearchFilters };
