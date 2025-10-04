import React from "react";
import { Group, GroupProps, Text } from "@mantine/core";
import { cn, Link } from "@repo/ui";
import { IonRippleEffect } from "@ionic/react";
import { IconProps } from "@tabler/icons-react";

interface Props extends GroupProps {
  title: string;
  Icon: React.ComponentType<IconProps>;
  href: string;
}

const SidebarButton = ({ title, Icon, href, ...others }: Props) => {
  return (
    <Link href={href} className={"w-full relative ion-activatable"}>
      <IonRippleEffect />
      <Group
        className={cn(
          "w-full bg-[#1A1A1A] h-14 px-8 py-4 border-[#242424] border-b",
          others.className,
        )}
      >
        <Icon size={24} color={"#E3E3E3"} />
        <Text span className={"font-bold"}>
          {title}
        </Text>
      </Group>
    </Link>
  );
};

export { SidebarButton };
