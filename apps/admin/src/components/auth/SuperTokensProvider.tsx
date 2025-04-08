"use client";

import SuperTokensReact, { SuperTokensWrapper } from "supertokens-auth-react";
import React from "react";
import Session, { SessionAuth } from "supertokens-auth-react/recipe/session";
import Passwordless from "supertokens-auth-react/recipe/passwordless";
import ThirdParty from "supertokens-auth-react/recipe/thirdparty";
import {
  GetRedirectionURLContext,
  SuperTokensConfig,
} from "supertokens-auth-react/lib/build/types";
import Router from "next/router";
import { WindowHandlerInterface } from "supertokens-website/lib/build/utils/windowHandler/types";
import { AuthRecipeComponentsOverrideContextProvider } from "supertokens-auth-react/ui";
import { GameNodeLogo } from "@repo/ui";

export const frontendConfig = (): SuperTokensConfig => {
  const websiteDomain = process.env.NEXT_PUBLIC_DOMAIN_WEBSITE as string;
  const mainWebsiteDomain = "https://gamenode.app";
  return {
    appInfo: {
      appName: "GameNode Admin",
      apiDomain: process.env.NEXT_PUBLIC_DOMAIN_SERVER as string,
      websiteDomain: websiteDomain,
      apiBasePath: "/v1/auth",
      websiteBasePath: "/auth",
    },
    style: `
        [data-supertokens~=container] {
            --palette-background: 28, 28, 28;
            --palette-inputBackground: 41, 41, 41;
            --palette-inputBorder: 41, 41, 41;
            --palette-textTitle: 255, 255, 255;
            --palette-textLabel: 255, 255, 255;
            --palette-textPrimary: 255, 255, 255;
            --palette-primaryBorder: 0, 0, 0;
            --palette-primary: 241, 81, 38;
            --palette-error: 173, 46, 46;
            --palette-textInput: 169, 169, 169;
            --palette-textLink: 114,114,114;
            --palette-textGray: 158, 158, 158;
        }
    `,
    getRedirectionURL: async (context: GetRedirectionURLContext) => {
      if (context.action == "TO_AUTH") {
        if (process.env.NODE_ENV === "production")
          return `${mainWebsiteDomain}/auth?redirectToPath=${websiteDomain}`;

        return "/auth";
      }

      if (context.redirectToPath !== undefined) {
        // we are navigating back to where the user was before they authenticated
        return context.redirectToPath;
      }

      return "/";
    },
    recipeList: [
      Passwordless.init({
        contactMethod: "EMAIL",
      }),
      ThirdParty.init({
        signInAndUpFeature: {
          providers: [
            ThirdParty.Discord.init(),
            ThirdParty.Google.init(),
            ThirdParty.Twitter.init(),
          ],
        },
      }),
      Session.init(),
    ],
    windowHandler: (oI: WindowHandlerInterface) => {
      return {
        ...oI,
        location: {
          ...oI.location,
          setHref: (href: string) => {
            Router.push(href);
          },
        },
      };
    },
  };
};

if (typeof window !== "undefined") {
  // we only want to call this init function on the frontend, so we check typeof window !== 'undefined'
  SuperTokensReact.init(frontendConfig());
}

const SuperTokensProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SuperTokensWrapper>
      <AuthRecipeComponentsOverrideContextProvider
        components={{
          AuthPageHeader_Override: () => {
            return <GameNodeLogo style={{ marginBottom: 20 }} />;
          },
        }}
      >
        <SessionAuth requireAuth={false}>{children}</SessionAuth>
      </AuthRecipeComponentsOverrideContextProvider>
    </SuperTokensWrapper>
  );
};

export default SuperTokensProvider;
