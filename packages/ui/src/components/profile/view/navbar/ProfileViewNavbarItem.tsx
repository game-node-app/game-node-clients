import React, { ExoticComponent, PropsWithoutRef } from "react";
import { Stack, Tabs, TabsTabProps, Text } from "@mantine/core";
import { IconProps } from "@tabler/icons-react";
import { Link } from "#@/util";
import { buildPresenterComponent } from "#@/context";

export interface ProfileViewNavbarItemProps extends TabsTabProps {
  label: string;
  icon?: ExoticComponent<PropsWithoutRef<IconProps>>;
  count?: number;
  href?: string;
  activeTab: string | null;
}

const DEFAULT_ProfileViewNavbarItem = ({
  label,
  count,
  value,
  href,
  activeTab,
  ...others
}: ProfileViewNavbarItemProps) => {
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
          className={
            "items-center gap-1 text-[#868686] data-[active=true]:text-white"
          }
        >
          {others.icon != undefined && (
            <others.icon
              className={
                "font-bold text-[#868686] data-[active=true]:text-white"
              }
              size={"2rem"}
              data-active={activeTab === value ? "true" : "false"}
            />
          )}
          {count != undefined && (
            <Text
              className={
                "font-bold text-lg text-[#868686] data-[active=true]:text-white"
              }
              data-active={activeTab === value ? "true" : "false"}
            >
              {count}
            </Text>
          )}
          <Text
            className={"font-bold text-[#868686] data-[active=true]:text-white"}
            data-active={activeTab === value ? "true" : "false"}
          >
            {label}
          </Text>
        </Stack>
      </Link>
    </Tabs.Tab>
  );
};

const ProfileViewNavbarItem = buildPresenterComponent(
  "ProfileViewNavbarItem",
  DEFAULT_ProfileViewNavbarItem,
);

export { ProfileViewNavbarItem };
