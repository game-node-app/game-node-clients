// prettier-ignore
"use no memo"

import { getTabAwareHref } from "@/util/getTabAwareHref";
import { Link } from "react-router-dom";
import React, { MouseEventHandler } from "react";
import { Badge, Group, GroupProps, Text, TextProps } from "@mantine/core";
import { cn } from "@repo/ui";
import { IonRippleEffect } from "@ionic/react";
import { IconProps } from "@tabler/icons-react";

interface Props extends Omit<GroupProps, "onClick"> {
  title: string;
  Icon: React.ComponentType<IconProps>;
  /**
   * {@link getTabAwareHref} automatically applied.
   */
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  iconProps?: IconProps;
  textProps?: TextProps;
  withBadge?: boolean;
}

const MobileSidebarButton = ({
  title,
  onClick,
  Icon,
  href,
  iconProps,
  textProps,
  withBadge,
  ...others
}: Props) => {
  return (
    <Link
      to={getTabAwareHref(href)}
      onClick={onClick}
      className={"w-full relative ion-activatable"}
    >
      <IonRippleEffect />
      <Group
        className={cn(
          "w-full bg-paper-8 h-14 px-8 py-4 border-paper-4 border-b",
          others.className,
        )}
      >
        <Icon
          size={24}
          {...iconProps}
          className={cn("text-[var(--gn-text)]", iconProps?.className)}
        />
        <Text span {...textProps}>
          {title}
        </Text>
        {withBadge && (
          <Badge size={"xs"} className={""}>
            NEW
          </Badge>
        )}
      </Group>
    </Link>
  );
};

export { MobileSidebarButton };
