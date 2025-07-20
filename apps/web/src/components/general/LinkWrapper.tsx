import { LinkComponentProps } from "@repo/ui";
import Link from "next/link";

export function LinkWrapper(props: LinkComponentProps) {
  return <Link {...props} href={props.href} />;
}
