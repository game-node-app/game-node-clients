"use client";

import SuperTokensReact, { SuperTokensWrapper } from "supertokens-auth-react";
import React from "react";
import Session from "supertokens-auth-react/recipe/session";
import Passwordless from "supertokens-auth-react/recipe/passwordless";
import ThirdParty from "supertokens-auth-react/recipe/thirdparty";
import { SuperTokensConfig } from "supertokens-auth-react/lib/build/types";
import { usePathname, useRouter } from "next/navigation";

const IS_DEV = process.env.NODE_ENV !== "production";

const routerInfo: { router?: ReturnType<typeof useRouter>; pathName?: string } =
    {};

export function setRouter(
    router: ReturnType<typeof useRouter>,
    pathName: string,
) {
    routerInfo.router = router;
    routerInfo.pathName = pathName;
}

export const frontendConfig = (): SuperTokensConfig => {
    return {
        appInfo: {
            appName: "GameNode Admin",
            apiDomain: process.env.NEXT_PUBLIC_DOMAIN_SERVER as string,
            websiteDomain: process.env.NEXT_PUBLIC_DOMAIN_WEBSITE as string,
            apiBasePath: "/v1/auth",
            websiteBasePath: "/auth",
        },
        recipeList: [
            Passwordless.init({
                contactMethod: "EMAIL",
            }),
            ThirdParty.init({
                signInAndUpFeature: {
                    providers: [
                        // TODO: Enable once it's approved
                        // ThirdPartyPasswordlessReact.Google.init(),
                        ThirdParty.Discord.init(),
                    ],
                },
            }),
            Session.init(),
        ],
        windowHandler: (original) => ({
            ...original,
            location: {
                ...original.location,
                getPathName: () => routerInfo.pathName!,
                assign: (url) => routerInfo.router!.push(url.toString()),
                setHref: (url) => routerInfo.router!.push(url.toString()),
            },
        }),
    };
};

if (typeof window !== "undefined") {
    // we only want to call this init function on the frontend, so we check typeof window !== 'undefined'
    SuperTokensReact.init(frontendConfig());
}

const SuperTokensProvider = ({ children }: { children: React.ReactNode }) => {
    setRouter(useRouter(), usePathname() || window.location.pathname);

    return <SuperTokensWrapper>{children}</SuperTokensWrapper>;
};

export default SuperTokensProvider;
