import React, { PropsWithChildren } from "react";
import { Browser } from "@capacitor/browser";

interface Props extends PropsWithChildren {
    href: string | undefined;
}

/**
 * Opens a external link in a in-app browser.
 * @returns
 */
export const ExternalLink = ({ href, children }: Props) => {
    return (
        <div
            style={{
                cursor: "pointer",
            }}
            onClick={() => {
                if (href) {
                    Browser.open({
                        url: href,
                    });
                }
            }}
        >
            {children}
        </div>
    );
};

export default ExternalLink;
