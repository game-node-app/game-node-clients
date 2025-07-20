import React, { useEffect, useState } from "react";
import { IonApp, IonFab, IonFabButton, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
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
import "@ionic/react/css/padding.css";
/* Theme variables */
import "./theme/variables.css";
/*
 * YARL
 */
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import SuperTokensProvider from "./components/auth/SuperTokensProvider";
import { IconHome } from "@tabler/icons-react";
import NotificationsManager from "./components/general/NotificationsManager";
import AppUrlListener from "./components/general/AppUrlListener";
import Tabs from "./Tabs";
import { Keyboard } from "@capacitor/keyboard";
import AppUpdateListener from "@/components/general/AppUpdateListener";
import {
  DEFAULT_MANTINE_THEME,
  setLinkComponent,
  setModalComponent,
  setProjectContext,
  setRouterHook,
} from "@repo/ui";
import { LinkWrapper } from "@/components/general/LinkWrapper";
import { useIonRouterWrapper } from "@/components/general/hooks/useIonRouterWrapper";
import { IonModalWrapper } from "@/components/general/IonModalWrapper";
import { setupWrapper } from "@repo/wrapper";
import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
import { Device } from "@capacitor/device";

/**
 * dayjs setup
 */
dayjs.extend(RelativeTime);
dayjs.extend(LocalizedFormat);

/**
 * @repo/ui setup
 */
setLinkComponent(LinkWrapper);
setRouterHook(useIonRouterWrapper);
setModalComponent(IonModalWrapper);
setProjectContext({
  client: "mobile",
  s3BucketUrl: import.meta.env.VITE_PUBLIC_S3_BUCKET_URL!,
});
setupWrapper({
  serverBaseURL: import.meta.env.VITE_PUBLIC_SERVER_URL!,
  searchBaseURL: import.meta.env.VITE_PUBLIC_SEARCH_URL!,
});

setupIonicReact();

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

  useEffect(() => {
    (async () => {
      const info = await Device.getInfo();
      if (info.platform === "android" && Number(info.osVersion) >= 15) {
        await EdgeToEdge.enable(); // Enable only on Android 15+
        await EdgeToEdge.setBackgroundColor({
          color: "#1f1f1f",
        });
      } else {
        await EdgeToEdge.disable(); // Prevents layout issues on older Android versions
      }
    })();
  }, []);

  return (
    <IonApp>
      <SuperTokensProvider>
        <MantineProvider
          theme={DEFAULT_MANTINE_THEME}
          forceColorScheme={"dark"}
        >
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
