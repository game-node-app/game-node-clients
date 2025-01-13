import React, {
    ExoticComponent,
    PropsWithChildren,
    PropsWithoutRef,
} from "react";
import { IconBrandXbox, IconProps } from "@tabler/icons-react";
import { Box, BoxProps, ThemeIcon, ThemeIconProps } from "@mantine/core";

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
            className={"w-fit h-fit min-w-fit bg-[#161616] border-[#161616]"}
            {...props.wrapperProps}
        >
            <props.icon size={"3rem"} {...props.iconProps} />
        </ThemeIcon>
    );
};

export default RoundedIcon;
