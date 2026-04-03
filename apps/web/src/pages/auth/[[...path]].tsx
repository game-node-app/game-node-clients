import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { AuthPage, getRoutingComponent } from "supertokens-auth-react/ui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import { useRouter } from "next/router";
import { useDisclosure } from "@mantine/hooks";

const SuperTokensComponentNoSSR = dynamic<unknown>(
  new Promise((res) =>
    res(() =>
      getRoutingComponent([ThirdPartyPreBuiltUI, PasswordlessPreBuiltUI]),
    ),
  ),
  { ssr: false },
);

export default function Auth() {
  const router = useRouter();
  const [isClient, isClientUtils] = useDisclosure();

  // if the user visits a page that is not handled by us (like /auth/random), then we redirect them back to the auth page.
  useEffect(() => {
    if (isClient) {
      return;
    }

    isClientUtils.open();
  }, [isClient, isClientUtils, router.locale]);

  if (!isClient) return null;

  return (
    <AuthPage preBuiltUIList={[ThirdPartyPreBuiltUI, PasswordlessPreBuiltUI]} />
  );
}
