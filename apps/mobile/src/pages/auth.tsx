import { AppPage } from "@/components/general/AppPage.tsx";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import { Capacitor } from "@capacitor/core";
import { useIonRouter } from "@ionic/react";
import { SignInScreen } from "@repo/ui";

const AuthPage = () => {
  const ionRouter = useIonRouter();
  const query = useSearchParameters();

  return (
    <AppPage withSearch={false}>
      <SignInScreen
        homePath={"/home"}
        relativeCallbacks={Capacitor.isNativePlatform()}
        // This page was pushed over the one that asked for sign-in, so popping it is the native way back.
        onSignedIn={(target) =>
          ionRouter.canGoBack() && query.has("redirectTo")
            ? ionRouter.goBack()
            : ionRouter.push(target, "root", "replace")
        }
      />
    </AppPage>
  );
};

export default AuthPage;
