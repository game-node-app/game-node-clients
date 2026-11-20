import React, { forwardRef } from "react";
import { Chip, ChipProps } from "@mantine/core";

interface Props extends Omit<ChipProps, "onChange" | "checked" | "icon"> {
  icon: React.ReactNode;
}

const ActionChip = forwardRef((props: Props, ref) => {
  return (
    <Chip
      rootRef={ref as never}
      {...props}
      variant={"outline"}
      checked
      classNames={{
        ...props.classNames,
        iconWrapper: "me-1",
      }}
      color={"var(--gn-paper-1)"}
    />
  );
});

ActionChip.displayName = "ActionChip";

export { ActionChip };
