import React, { ExoticComponent, PropsWithoutRef } from "react";
import { IconDeviceGamepad2, IconProps } from "@tabler/icons-react";
import { Group, Stack, Text, Title } from "@mantine/core";
import RoundedIcon from "@/components/general/RoundedIcon";

interface ProfileStatsDataIconProps {
    description: string;
    count?: number;
    icon: ExoticComponent<PropsWithoutRef<IconProps>>;
}

const ProfileStatsDataIcon = ({
    description,
    count = 0,
    icon,
}: ProfileStatsDataIconProps) => {
    return (
        <Group className={"gap-2 flex-nowrap"}>
            <RoundedIcon
                icon={icon}
                iconProps={{
                    size: "3rem",
                }}
            />
            <Stack className={"gap-0.5"}>
                <Title size={"h2"} className={"text-brand-4"}>
                    {count}
                </Title>
                <Text className={"text-md"}>{description}</Text>
            </Stack>
        </Group>
    );
};

export default ProfileStatsDataIcon;
