import { Stack } from "@mantine/core";
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
          router.push("/home");
          return;
        } else if ("reason" in response) {
          notifications.show({
            title: `Sign in/up failed`,
            message: response.reason,
            color: "red",
          });
        } else {
          notifications.show({
            title: `Sign in/up failed`,
            message: "An unknown error occurred.",
            color: "red",
          });
        }

        // Redirect to auth page to retry sign in/up
        redirectToAuth({ redirectBack: false });
      } catch (e: unknown) {
        notifications.show({
          title: `Sign in/up failed`,
          message:
            e instanceof Error ? e.message : "An unknown error occurred.",
          color: "red",
        });
        console.error(e);
      }
    })();
  }, [router]);

  return (
    <Stack className="w-full h-full">
      <CenteredLoading />
    </Stack>
  );
};

export default AuthCallbackPage;
