import React, { ComponentType, MouseEventHandler } from "react";
import { Box, Menu, Text } from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { Link } from "@repo/ui";

interface Props {
  label: string;
  href: string;
  Icon: ComponentType<IconProps>;
  color?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

const GlobalShellNavbarUserMenuItem = ({
  label,
  href,
  Icon,
  color,
  onClick,
}: Props) => {
  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      onClick={onClick}
    >
      <Menu.Item
        classNames={{
          item: "h-9 w-full items-center gap-2.5 flex flex-nowrap ps-4 rounded hover:bg-paper-8 data-[active]:bg-paper-8",
          itemSection: "me-0",
        }}
        leftSection={<Icon size={20} color={color} />}
      >
        <Text className={"text-[#E3E3E3]"} c={color}>
          {label}
        </Text>
      </Menu.Item>
    </Link>
  );
};

export { GlobalShellNavbarUserMenuItem };
