import React, { useState } from "react";
import {
  Chip,
  Combobox,
  ComboboxItem,
  Group,
  SelectProps,
  useCombobox,
} from "@mantine/core";
import { IconSortAscending, IconSortDescending } from "@tabler/icons-react";

interface Props
  extends Omit<SelectProps, "onChange" | "value" | "allowDeselect" | "data"> {
  defaultValue: string;
  onChange: (value: string, order: "ASC" | "DESC") => void;
  data: ComboboxItem[];
}

const SortingChip = ({ data, onChange, defaultValue, ...others }: Props) => {
  const combobox = useCombobox();

  const [internalSelectedItem, setInternalSelectedItem] =
    useState<string>(defaultValue);
  const [internalSelectedOrdering, setInternalSelectedOrdering] = useState<
    "ASC" | "DESC"
  >("DESC");

  const options = data?.map((option, i) => {
    const checked = option.value === internalSelectedItem;
    return (
      <Combobox.Option key={i} value={option.value} className={"min-w-32"}>
        <Group className={"w-full flex-nowrap justify-between"}>
          {option.label}
          {checked ? (
            internalSelectedOrdering === "ASC" ? (
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
      onOptionSubmit={(v) => {
        if (v !== internalSelectedItem) {
          // Only changes value when selecting another option
          onChange(v, internalSelectedOrdering);
          setInternalSelectedItem(v);
          return;
        }

        const updatedOrdering =
          internalSelectedOrdering === "ASC" ? "DESC" : "ASC";

        setInternalSelectedOrdering(updatedOrdering);
        onChange(internalSelectedItem, updatedOrdering);
        return;
      }}
    >
      <Combobox.Target>
        <Chip
          variant={"outline"}
          checked
          icon={<IconSortDescending />}
          classNames={{
            iconWrapper: "me-1",
          }}
          color={"#262525"}
          onClick={() => combobox.toggleDropdown()}
        >
          Sort
        </Chip>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>{options}</Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

export { SortingChip };
