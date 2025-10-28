import React from "react";
import { cn, Link, ProfileViewNavbarItemProps } from "@repo/ui";
import { Box, Flex, Tabs, Text } from "@mantine/core";
import { IonRippleEffect } from "@ionic/react";

const MobileProfileViewNavbarItem = ({
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
        <Flex
          className={cn(
            "w-full h-14 rounded-md justify-center items-center bg-paper-2 gap-2 relative ion-activatable",
            {
              "bg-paper-0": activeTab === value,
            },
          )}
        >
          <IonRippleEffect className={"rounded-md"} />
          {count != undefined && (
            <Text className={"text-white font-bold text-lg"}>{count}</Text>
          )}
          <Text className={"text-dimmed font-medium text-lg"}>{label}</Text>
        </Flex>
      </Link>
    </Tabs.Tab>
  );
};

export { MobileProfileViewNavbarItem };
