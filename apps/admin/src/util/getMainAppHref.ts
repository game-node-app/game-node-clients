const MAIN_WEBSITE_DOMAIN = process.env
    .NEXT_PUBLIC_DOMAIN_MAIN_WEBSITE as string;

export function getMainAppHref(href: string) {
    return `${MAIN_WEBSITE_DOMAIN}${href}`;
}
