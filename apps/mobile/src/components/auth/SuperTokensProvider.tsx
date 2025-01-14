import SuperTokensReact, { SuperTokensWrapper } from "supertokens-auth-react";
import React from "react";
import Session from "supertokens-auth-react/recipe/session";
import Passwordless from "supertokens-auth-react/recipe/passwordless";
import ThirdParty, { Discord } from "supertokens-auth-react/recipe/thirdparty";
import { SuperTokensConfig } from "supertokens-auth-react/lib/build/types";
import { Capacitor } from "@capacitor/core";
import capacitorCookieHandler from "@/util/capacitorCookieHandler";

/**
 * @see https://github.com/RobSchilderr/nextjs-native-starter/blob/main/apps/next-app/config/frontendConfig.ts
 */
export const frontendConfig = (): SuperTokensConfig => {
    const PARSED_WEBSITE_DOMAIN = Capacitor.isNativePlatform()
        ? `${window.location.protocol}//${window.location.host}`
        : import.meta.env.VITE_PUBLIC_DOMAIN_WEBSITE;

    return {
        appInfo: {
            appName: "GameNode",
            apiDomain: import.meta.env.VITE_PUBLIC_DOMAIN_SERVER as string,
            websiteDomain: PARSED_WEBSITE_DOMAIN,
            apiBasePath: "/v1/auth",
            websiteBasePath: "/m/auth",
        },
        cookieHandler: capacitorCookieHandler,
        getRedirectionURL: async (context) => {
            if (context.action === "SUCCESS" && context.newSessionCreated) {
                if (context.redirectToPath !== undefined) {
                    // we are navigating back to where the user was before they authenticated
                    return context.redirectToPath;
                }
                if (context.createdNewUser) {
                    // user signed up
                } else {
                    // user signed in
                }
                return "/home";
            } else if (context.action === "TO_AUTH") {
                return "/m/auth";
            }
            return undefined;
        },

        recipeList: [
            ThirdParty.init({
                signInAndUpFeature: {
                    providers: [Discord.init()],
                },
                override: {
                    functions: (oI) => {
                        return {
                            ...oI,
                            getAuthorisationURLWithQueryParamsAndSetState: async (input) => {
                                let frontendCallbackUrl: string;
                                if (Capacitor.isNativePlatform()) {
                                    // /m/ routes are used only for app deep linking
                                    frontendCallbackUrl = `https://gamenode.app/m/auth/callback/${input.thirdPartyId}`;
                                } else {
                                    frontendCallbackUrl = input.frontendRedirectURI;
                                }

                                return oI.getAuthorisationURLWithQueryParamsAndSetState({
                                    ...input,
                                    frontendRedirectURI: frontendCallbackUrl,
                                });
                            },
                        };
                    },
                },
            }),
            Passwordless.init({
                contactMethod: "EMAIL",
            }),
            Session.init({
                tokenTransferMethod: "header",
            }),
        ],
    };
};

if (typeof window !== "undefined") {
    // we only want to call this init function on the frontend, so we check typeof window !== 'undefined'
    SuperTokensReact.init(frontendConfig());
}

const SuperTokensProvider = ({ children }: { children: React.ReactNode }) => {
    return <SuperTokensWrapper>{children}</SuperTokensWrapper>;
};

export default SuperTokensProvider;
