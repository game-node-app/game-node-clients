import React, { useMemo } from "react";
import { Group, Image, Text } from "@mantine/core";
import { getServerStoredIcon } from "#@/util";
import { YearRecapPlatformCountDto } from "@repo/wrapper/server";

const PLATFORM_ABBREVIATION_TO_BG_COLOR: Record<string, string> = {
  PC: "bg-[#103287]",
  PS4: "bg-[#2761F4]",
  PS5: "bg-[#2761F4]",
  XboxOne: "bg-[#2BBF18]",
  XboxSeriesX: "bg-[#2BBF18]",
  Switch: "bg-red-500",
  Mobile: "bg-yellow-500",
};

interface Props {
  platform: YearRecapPlatformCountDto;
}

const RecapPlatformCount = ({ platform }: Props) => {
  const platformBgColor = useMemo(() => {
    return (
      PLATFORM_ABBREVIATION_TO_BG_COLOR[platform.abbreviation] || "bg-paper"
    );
  }, [platform.abbreviation]);

  return (
    <Group
      className={`w-24 h-8 justify-between p-1 rounded-md ${platformBgColor}`}
    >
      <Image src={getServerStoredIcon(platform.iconName!)} className={"w-5"} />
      <Text className={"font-bold"}>{platform.count}</Text>
    </Group>
  );
};

export { RecapPlatformCount };
