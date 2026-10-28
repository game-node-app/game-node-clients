import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { redirectToAuth } from "supertokens-auth-react";
import { canHandleRoute, getRoutingComponent } from "supertokens-auth-react/ui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";

const SuperTokensComponentNoSSR = dynamic<unknown>(
  new Promise((res) => res(() => getRoutingComponent([ThirdPartyPreBuiltUI]))),
  { ssr: false },
);

export default function Auth() {
  // if the user visits a page that is not handled by us (like /auth/random), then we redirect them back to the auth page.
  useEffect(() => {
    if (!canHandleRoute([ThirdPartyPreBuiltUI])) {
      redirectToAuth();
    }
  }, []);

  return <SuperTokensComponentNoSSR />;
}
