import { useDisclosure } from "@mantine/hooks";
import { useEffect } from "react";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { AuthPage } from "supertokens-auth-react/ui";

export default function Auth() {
  const [isClient, isClientUtils] = useDisclosure();

  // if the user visits a page that is not handled by us (like /auth/random), then we redirect them back to the auth page.
  useEffect(() => {
    if (isClient) {
      return;
    }

    isClientUtils.open();
  }, [isClient, isClientUtils]);

  if (!isClient) return null;

  return (
    <AuthPage preBuiltUIList={[ThirdPartyPreBuiltUI, PasswordlessPreBuiltUI]} />
  );
}
