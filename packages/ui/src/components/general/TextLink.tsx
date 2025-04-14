import React from "react";
import { Link } from "#@/util";

interface ITextLinkProps extends React.HTMLProps<HTMLAnchorElement> {
  href: string;
}

const TextLink = ({ href, children, ...linkProps }: ITextLinkProps) => {
  return (
    <Link
      href={href}
      {...linkProps}
      className={`underline ${linkProps.className ?? ""}`}
    >
      {children}
    </Link>
  );
};

export { TextLink };
