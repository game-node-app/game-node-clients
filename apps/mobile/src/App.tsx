import React, { useEffect, useState } from "react";
import { IonApp, IonFab, IonFabButton, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { theme } from "./util/theme";

/**
 * Should always be imported BEFORE tailwind.
 */
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/carousel/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/tiptap/styles.css";
import "@mantine/charts/styles.css";

/**
 * Includes tailwind styles
 */
import "@/components/globals.css";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */
import "@ionic/react/css/palettes/dark.always.css";
/* import '@ionic/react/css/palettes/dark.class.css'; */
// import '@ionic/react/css/palettes/dark.system.css';
/* Theme variables */
import "./theme/variables.css";
import SuperTokensProvider from "./components/auth/SuperTokensProvider";
import { IconHome } from "@tabler/icons-react";
import { OpenAPI as ServerOpenAPI } from "@repo/wrapper/server";
import { OpenAPI as SearchOpenAPI } from "@repo/wrapper/search";
import NotificationsManager from "./components/general/NotificationsManager";
import AppUrlListener from "./components/general/AppUrlListener";
import Tabs from "./Tabs";
import { Keyboard } from "@capacitor/keyboard";
import AppUpdateListener from "@/components/general/AppUpdateListener";
import {
  setModalComponent,
  setRoutingComponent,
  setRoutingManager,
} from "@repo/ui";
import { LinkWrapper } from "@/components/general/LinkWrapper";
import { useIonRouterWrapper } from "@/components/general/hooks/useIonRouterWrapper";
import { IonModalWrapper } from "@/components/general/IonModalWrapper";

/**
 * Basic configuration for wrapper services
 */
ServerOpenAPI.BASE = import.meta.env.VITE_PUBLIC_SERVER_URL!;
ServerOpenAPI.WITH_CREDENTIALS = true;
SearchOpenAPI.BASE = import.meta.env.VITE_PUBLIC_SEARCH_URL!;

setupIonicReact();

/**
 * @repo/ui setup
 */
setRoutingComponent(LinkWrapper);
setRoutingManager(useIonRouterWrapper);
setModalComponent(IonModalWrapper);

const App: React.FC = () => {
  const [keyboardOpened, setKeyboardOpened] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchInterval: false,
            refetchOnMount: false,
            refetchIntervalInBackground: false,
            refetchOnReconnect: false,
            staleTime: Infinity,
            retry: 2,
          },
        },
      }),
  );

  useEffect(() => {
    Keyboard.addListener("keyboardWillShow", () => {
      setKeyboardOpened(true);
    });
    Keyboard.addListener("keyboardWillHide", () => {
      setKeyboardOpened(false);
    });

    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);

  return (
    <IonApp>
      <SuperTokensProvider>
        <MantineProvider theme={theme} forceColorScheme={"dark"}>
          <QueryClientProvider client={queryClient}>
            <IonReactRouter>
              <AppUrlListener />
              <AppUpdateListener />
              <NotificationsManager />
              <Tabs />
              <IonFab
                className={keyboardOpened ? "hidden" : undefined}
                slot="fixed"
                horizontal="center"
                vertical="bottom"
                edge={false}
              >
                <IonFabButton routerLink={"/home"}>
                  <IconHome />
                </IonFabButton>
              </IonFab>
            </IonReactRouter>
          </QueryClientProvider>
        </MantineProvider>
      </SuperTokensProvider>
    </IonApp>
  );
};

export default App;
