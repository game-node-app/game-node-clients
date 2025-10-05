import React from "react";
import { Box } from "@mantine/core";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { AuthPage } from "supertokens-auth-react/ui";
import { useIonRouter } from "@ionic/react";
import { AppPage } from "@/components/general/AppPage.tsx";

const SupertokensAuthPage = () => {
  const router = useIonRouter();

  return (
    <AppPage withSearch={false}>
      <Box className={"w-full h-full mt-20"}>
        <AuthPage
          preBuiltUIList={[ThirdPartyPreBuiltUI, PasswordlessPreBuiltUI]}
          navigate={{
            push: router.push,
            goBack: router.goBack,
          }}
        />
      </Box>
    </AppPage>
  );
};

export default SupertokensAuthPage;
