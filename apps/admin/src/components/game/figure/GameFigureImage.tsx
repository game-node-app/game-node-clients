import React, {
    ComponentProps,
    PropsWithChildren,
    useEffect,
    useState,
} from "react";
import { AspectRatio, Image, ImageProps } from "@mantine/core";
import Link from "next/link";
import {
    getSizedImageUrl,
    ImageSize,
} from "@/components/game/util/getSizedImageUrl";
import { TGameOrSearchGame } from "@/components/game/util/types";
import { getCoverUrl } from "@/components/game/util/getCoverUrl";
import MainAppLink from "@/components/general/MainAppLink";

export interface IGameFigureProps
    extends PropsWithChildren<Omit<ComponentProps<typeof Link>, "href">> {
    game: TGameOrSearchGame | undefined;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    imageProps?: ImageProps;
    href?: string;
}

/**
 * This component is the base building block for anything related to showing a game's metadata.
 * It only handles logic related to image loading (skeletons, etc.).
 *
 * @param metadata
 * @param href
 * @constructor
 */
const GameFigureImage = ({
    game,
    imageProps,
    href,
    onClick,
    children,
    ...others
}: IGameFigureProps) => {
    const coverUrl = getCoverUrl(game);
    const sizedCoverUrl = getSizedImageUrl(coverUrl, ImageSize.COVER_BIG);
    const defaultHref = `/game/${game?.id}`;
    return (
        <MainAppLink
            href={href ?? defaultHref}
            className="w-full h-auto"
            onClick={onClick}
            {...others}
        >
            <AspectRatio ratio={264 / 354} pos="relative" h={"100%"} w={"auto"}>
                <Image
                    radius={"sm"}
                    src={sizedCoverUrl ?? "/img/game_placeholder.jpeg"}
                    alt={"Game cover"}
                    className="w-full h-auto max-h-full"
                    {...imageProps}
                />
                {children}
            </AspectRatio>
        </MainAppLink>
    );
};

export default GameFigureImage;
