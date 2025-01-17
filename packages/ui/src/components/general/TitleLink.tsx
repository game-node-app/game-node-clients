import React, { PropsWithChildren } from "react";
import { Title, TitleProps } from "@mantine/core";
import { Link } from "#@/util";

interface ITitleLinkProps extends PropsWithChildren<TitleProps> {
  href: string;
  linkProps?: React.HTMLProps<HTMLAnchorElement>;
}

const TitleLink = ({
  href,
  children,
  linkProps,
  ...titleProps
}: ITitleLinkProps) => {
  return (
    <Link href={href} {...linkProps}>
      <Title {...titleProps} className={`underline ${titleProps.className}`}>
        {children}
      </Title>
    </Link>
  );
};

export { TitleLink };
