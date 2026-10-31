"use no memo";
import { getTabAwareHref } from "@/util/getTabAwareHref";
import { Link, LinkProps } from "react-router-dom";

interface Props extends Omit<LinkProps, "to"> {
  href: string;
}

export function LinkWrapper(props: Props) {
  return <Link {...props} to={getTabAwareHref(props.href)} />;
}