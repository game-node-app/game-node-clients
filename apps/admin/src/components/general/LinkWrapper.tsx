import React from "react";
import { RoutingComponent } from "@repo/ui";
import Link from "next/link";

export function LinkWrapper(props: RoutingComponent) {
  return <Link {...props} href={props.href} />;
}
