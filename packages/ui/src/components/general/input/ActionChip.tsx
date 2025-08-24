import React from "react";
import { Chip, ChipProps } from "@mantine/core";
import { IconSortDescending } from "@tabler/icons-react";

interface Props extends Omit<ChipProps, "onChange" | "checked" | "icon"> {
  icon: React.ReactNode;
}

const ActionChip = (props: Props) => {
  return (
    <Chip
      {...props}
      variant={"outline"}
      checked
      classNames={{
        ...props.classNames,
        iconWrapper: "me-1",
      }}
      color={"#262525"}
    />
  );
};

export { ActionChip };
