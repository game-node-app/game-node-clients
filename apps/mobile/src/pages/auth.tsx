import { useEffect } from "react";
import { AppPage } from "@/components/general/AppPage.tsx";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import { Capacitor } from "@capacitor/core";
import { useIonRouter } from "@ionic/react";
import { Loader } from "@mantine/core";
import { authClient, getSafeRedirectPath, SignInScreen } from "@repo/ui";

const AUTH_PATH = "/m/auth";
const HOME_PATH = "/home";

/**
 * Mobile-only auth page. It stays inside the tabs outlet, but leaves through Ionic's own router:
 * the page was pushed over the one that asked for sign-in, so popping it is the native way back.
 */
const AuthPage = () => {
  const ionRouter = useIonRouter();
  const query = useSearchParameters();
  const { data: session, isPending } = authClient.useSession();
  // MCP consent keeps using SignInScreen's own flow.
  const hasOAuthRequest = ["sig", "ba_param", "client_id"].some((k) =>
    query.has(k),
  );
  const signedIn = !!session && !isPending && !hasOAuthRequest;
  const target = getSafeRedirectPath(
    query.get("redirectTo"),
    HOME_PATH,
    AUTH_PATH,
  );

  // Ionic keeps this page mounted; `signedIn` flipping back to false re-arms the next sign-in.
  useEffect(() => {
    if (!signedIn) return;
    if (ionRouter.canGoBack() && query.has("redirectTo")) ionRouter.goBack();
    else ionRouter.push(target, "root", "replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot per signed-in spell
  }, [signedIn]);

  if (signedIn) {
    return (
      <AppPage withSearch={false}>
        <Loader color={"brand"} />
      </AppPage>
    );
  }

  return (
    <AppPage withSearch={false}>
      <SignInScreen
        homePath={HOME_PATH}
        relativeCallbacks={Capacitor.isNativePlatform()}
      />
    </AppPage>
  );
};

export default AuthPage;
