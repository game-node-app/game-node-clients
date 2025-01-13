import React, { PropsWithChildren } from "react";
import { Text, TextProps } from "@mantine/core";
import Link from "next/link";

interface ITextLinkProps extends PropsWithChildren<TextProps> {
    href: string;
    linkProps?: React.HTMLProps<HTMLAnchorElement>;
}

const TextLink = ({
    href,
    children,
    linkProps,
    ...textProps
}: ITextLinkProps) => {
    return (
        <Link href={href} {...linkProps}>
            <Text {...textProps} className={`underline ${textProps.className}`}>
                {children}
            </Text>
        </Link>
    );
};

export default TextLink;
