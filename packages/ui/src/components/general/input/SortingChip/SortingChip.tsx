import React from "react";
import {
  Button,
  Combobox,
  ComboboxItem,
  Group,
  SelectProps,
  useCombobox,
} from "@mantine/core";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { ActionChip } from "#@/components";

export type SortingChipValue = {
  value: string;
  ordering: "ASC" | "DESC";
};

interface Props
  extends Omit<SelectProps, "onChange" | "value" | "allowDeselect" | "data"> {
  value: SortingChipValue;
  onChange: (updatedValue: SortingChipValue) => void;
  data: ComboboxItem[];
}

const SortingChip = ({ data, onChange, value }: Props) => {
  const combobox = useCombobox();

  const options = data?.map((option, i) => {
    const checked = option.value === value.value;
    return (
      <Combobox.Option key={i} value={option.value} className={"min-w-32"}>
        <Group className={"w-full flex-nowrap justify-between"}>
          {option.label}
          {checked ? (
            value.ordering === "ASC" ? (
              <IconSortAscending />
            ) : (
              <IconSortDescending />
            )
          ) : null}
        </Group>
      </Combobox.Option>
    );
  });

  return (
    <Combobox
      store={combobox}
      width={175}
      offset={16}
      position={"bottom-start"}
      onOptionSubmit={(v) => {
        if (v !== value.value) {
          // Only changes value when selecting another option
          onChange({
            value: v,
            ordering: "DESC",
          });
          return;
        }

        const updatedOrdering = value.ordering === "ASC" ? "DESC" : "ASC";

        onChange({
          value: v,
          ordering: updatedOrdering,
        });
        return;
      }}
    >
      <Combobox.Target>
        <ActionChip
          icon={<IconSortDescending size={16} />}
          onClick={() => {
            console.log("Open!");
            combobox.toggleDropdown();
          }}
        >
          Sort
        </ActionChip>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export { SortingChip };
