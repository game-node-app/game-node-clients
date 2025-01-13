import React from "react";
import { getServerStoredIcon } from "@/util/getServerStoredImages";
import { Image, ImageProps } from "@mantine/core";

interface Props extends ImageProps {
    achievementId: string;
}

const AchievementLogo = ({ achievementId, ...others }: Props) => {
    return (
        <Image
            className="w-[48px] h-[48px]"
            src={getServerStoredIcon(achievementId)}
            alt={achievementId}
            height={48}
            width={48}
            {...others}
        />
    );
};

export default AchievementLogo;
