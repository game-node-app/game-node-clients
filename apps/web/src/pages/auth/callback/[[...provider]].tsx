import { notifications } from "@mantine/notifications";
import { CenteredLoading } from "@repo/ui";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { redirectToAuth } from "supertokens-auth-react";
import { signInAndUp } from "supertokens-auth-react/recipe/thirdparty";

const AuthCallbackPage = () => {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!router.isReady) return;
      try {
        const response = await signInAndUp();
        if (response.status === "OK") {
          if (
            response.createdNewRecipeUser &&
            response.user.loginMethods.length === 1
          ) {
            // sign up successful
          } else {
            // sign in successful
          }
          router.push("/");
        } else if (response.status === "SIGN_IN_UP_NOT_ALLOWED") {
          // the reason string is a user friendly message
          // about what went wrong. It can also contain a support code which users
          // can tell you so you know why their sign in / up was not allowed.
          notifications.show({
            title: "Sign in/up not allowed",
            message: response.reason,
            color: "red",
          });
        } else {
          // SuperTokens requires that the third party provider
          // gives an email for the user. If that's not the case, sign up / in
          // will fail.

          // As a hack to solve this, you can override the backend functions to create a fake email for the user.

          await redirectToAuth({ redirectBack: false });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e: unknown) {
        console.error(e);
      }
    })();
  }, [router]);

  return <CenteredLoading />;
};

export default AuthCallbackPage;
