import React, { ExoticComponent, PropsWithoutRef } from "react";
import { Stack, Tabs, TabsTabProps, Text } from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { Link } from "#@/util";

interface Props extends TabsTabProps {
  label: string;
  icon?: ExoticComponent<PropsWithoutRef<IconProps>>;
  count?: number;
  href?: string;
  activeTab: string | null;
}

const ProfileViewNavbarItem = ({
  label,
  count,
  value,
  href,
  activeTab,
  ...others
}: Props) => {
  return (
    <Tabs.Tab value={value} {...others}>
      <Link
        href={href ?? "#"}
        onClick={(evt) => {
          // Prevents screen flicker
          if (href == undefined) {
            evt.preventDefault();
          }
        }}
      >
        <Stack
          className={"items-center gap-1 data-[active=true]:text-white"}
          data-active={activeTab === value ? "true" : "false"}
        >
          {others.icon != undefined && (
            <others.icon className={"font-bold"} size={"2rem"} />
          )}
          {count != undefined && (
            <Text className={"font-bold text-lg"}>{count}</Text>
          )}
          <Text className={"font-bold"}>{label}</Text>
        </Stack>
      </Link>
    </Tabs.Tab>
  );
};

export { ProfileViewNavbarItem };
