import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { AuthPage } from "supertokens-auth-react/ui";

export default function Auth() {
  return (
    <AuthPage preBuiltUIList={[ThirdPartyPreBuiltUI, PasswordlessPreBuiltUI]} />
  );
}
