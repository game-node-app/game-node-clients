import { AppPage } from "@/components/general/AppPage.tsx";
import { useSearchParameters } from "@/components/general/hooks/useSearchParameters";
import { Capacitor } from "@capacitor/core";
import { useIonRouter } from "@ionic/react";
import { SignInScreen } from "@repo/ui";

const AuthPage = () => {
  const ionRouter = useIonRouter();
  const query = useSearchParameters();

  return (
    <AppPage
      withSearch={false}
      transparentHeader
      contentProps={{
        // No `ion-padding`: the screen paints its own background edge to edge,
        // and `fullscreen` lets it run behind the (transparent) header and status bar.
        className: "",
        fullscreen: true,
        style: { "--background": "var(--gn-body)" },
      }}
    >
      <SignInScreen
        homePath={"/home"}
        // Fill the page (not the viewport) and clear the floating tab bar.
        style={{
          minHeight: "100%",
          // Clear the transparent header that now overlays the top of the screen.
          paddingTop: "calc(var(--ion-safe-area-top, 0px) + 56px)",
          paddingBottom: 96,
        }}
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
