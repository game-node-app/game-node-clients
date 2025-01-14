import React, { useEffect, useState } from "react";
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonRouter } from "@ionic/react";
import { Container } from "@mantine/core";
import CenteredLoading from "@/components/general/CenteredLoading";
import { signInAndUp } from "supertokens-auth-react/recipe/thirdparty";
import { redirectToAuth } from "supertokens-auth-react";
import { getCapitalizedText } from "@/util/getCapitalizedText";

interface Props {
    provider: string;
}

const AuthCallbackPage = ({ provider }: Props) => {
    const router = useIonRouter();
    const [error, setError] = useState<string | undefined>(undefined);

    useEffect(() => {
        (async () => {
            if (router.routeInfo == undefined) {
                console.error("routeInfo is undefined!");
                return;
            }

            try {
                const response = await signInAndUp();
                console.log(response);
                if (response.status === "OK") {
                    console.log(response.user);
                    if (response.createdNewRecipeUser && response.user.loginMethods.length === 1) {
                        // sign up successful
                    } else {
                        // sign in successful
                    }
                    router.push("/");
                } else if (response.status === "SIGN_IN_UP_NOT_ALLOWED") {
                    // the reason string is a user friendly message
                    // about what went wrong. It can also contain a support code which users
                    // can tell you so you know why their sign in / up was not allowed.
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

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Signing in with {getCapitalizedText(provider)}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <Container className={"mt-20 min-h-screen"}>
                    <CenteredLoading message={"Fetching your credentials..."} />
                </Container>
            </IonContent>
        </IonPage>
    );
};

export default AuthCallbackPage;
