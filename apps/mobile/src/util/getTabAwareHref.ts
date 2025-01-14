/**
 * Retrieves a route  with the current tab prefix appended to it.
 * @param targetUrl
 */
export function getTabAwareHref(targetUrl: string): string {
    const pathname = window.location.pathname;
    const paths = pathname.split("/");
    const tab = paths[1];
    return `/${tab}${targetUrl}`;
}
