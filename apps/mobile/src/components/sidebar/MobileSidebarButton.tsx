// prettier-ignore
"use no memo"

import { getTabAwareHref } from "@/util/getTabAwareHref";
import { Link } from "react-router-dom";
import React, { MouseEventHandler } from "react";
import { Badge, Group, GroupProps, Text, TextProps } from "@mantine/core";
import { cn } from "@repo/ui";
import { IonRippleEffect } from "@ionic/react";
import { IconChevronRight, IconProps } from "@tabler/icons-react";

interface Props extends Omit<GroupProps, "onClick"> {
  title: string;
  Icon: React.ComponentType<IconProps>;
  /**
   * {@link getTabAwareHref} is applied to links within the current tab.
   */
  href: string;
  /** App-wide destination, such as the Wrapped tab root. */
  absolute?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  iconProps?: IconProps;
  textProps?: TextProps;
  withBadge?: boolean;
  /** Label of the badge; defaults to the legacy "NEW" pill. */
  badgeLabel?: string;
  /** Hides the trailing chevron (e.g. for actions that do not navigate). */
  hideChevron?: boolean;
}

const MobileSidebarButton = ({
  title,
  onClick,
  Icon,
  href,
  absolute,
  iconProps,
  textProps,
  withBadge,
  badgeLabel,
  hideChevron,
  ...others
}: Props) => {
  return (
    <Link
      to={absolute ? href : getTabAwareHref(href)}
      onClick={onClick}
      className={"block w-full relative ion-activatable"}
    >
      <IonRippleEffect />
      <Group
        wrap={"nowrap"}
        className={cn("w-full h-12 px-6 gap-4", others.className)}
      >
        <Icon
          size={22}
          stroke={1.6}
          {...iconProps}
          className={cn("text-emphasis shrink-0", iconProps?.className)}
        />
        <Text span className={"flex-1 truncate"} {...textProps}>
          {title}
        </Text>
        {withBadge && (
          <Badge size={"xs"} variant={"light"}>
            {badgeLabel ?? "NEW"}
          </Badge>
        )}
        {!hideChevron && (
          <IconChevronRight
            size={18}
            className={"text-dimmed shrink-0"}
            aria-hidden
          />
        )}
      </Group>
    </Link>
  );
};

export { MobileSidebarButton };
