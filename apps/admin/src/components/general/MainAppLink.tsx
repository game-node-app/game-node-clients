import React, { ComponentProps } from "react";
import Link from "next/link";
import { getMainAppHref } from "@/util/getMainAppHref";

const WEBSITE_DOMAIN = process.env.NEXT_PUBLIC_DOMAIN_MAIN_WEBSITE as string;

interface Props extends Omit<ComponentProps<typeof Link>, "href"> {
    href: string;
}

const MainAppLink = ({ href, ...others }: Props) => {
    return <Link href={getMainAppHref(href)} target={"_blank"} {...others} />;
};

export default MainAppLink;
