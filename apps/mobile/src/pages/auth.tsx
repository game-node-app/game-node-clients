import { AppPage } from "@/components/general/AppPage.tsx";
import { Capacitor } from "@capacitor/core";
import { SignInScreen } from "@repo/ui";

const AuthPage = () => {
  return (
    <AppPage withSearch={false}>
      <SignInScreen
        homePath={"/home"}
        relativeCallbacks={Capacitor.isNativePlatform()}
      />
    </AppPage>
  );
};

export default AuthPage;
