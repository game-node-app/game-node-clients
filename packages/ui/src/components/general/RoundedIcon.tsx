import { ThemeIcon, ThemeIconProps } from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { ExoticComponent, PropsWithoutRef } from "react";

interface RoundedIconProps {
  icon: ExoticComponent<PropsWithoutRef<IconProps>>;
  iconProps?: PropsWithoutRef<IconProps>;
  wrapperProps?: PropsWithoutRef<ThemeIconProps>;
}

const RoundedIcon = (props: RoundedIconProps) => {
  return (
    <ThemeIcon
      radius={"50%"}
      variant={"outline"}
      p={12}
      className={"w-fit h-fit min-w-fit bg-paper-0 border-paper-0"}
      {...props.wrapperProps}
    >
      <props.icon size={"3rem"} {...props.iconProps} />
    </ThemeIcon>
  );
};

export { RoundedIcon };