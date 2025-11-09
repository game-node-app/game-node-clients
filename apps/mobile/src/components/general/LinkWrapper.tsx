"use no memo";
import React, { HTMLProps } from "react";
import { Link, LinkProps } from "react-router-dom";
import { getTabAwareHref } from "@/util/getTabAwareHref";

interface Props extends Omit<LinkProps, "to"> {
  href: string;
}

export function LinkWrapper(props: Props) {
  return <Link {...props} to={getTabAwareHref(props.href)} />;
}
