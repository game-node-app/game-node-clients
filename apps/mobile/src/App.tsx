import React, { useEffect, useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
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
import NotificationsManager from "./components/general/NotificationsManager";
import AppUrlListener from "./components/general/AppUrlListener";
import Tabs from "./Tabs";
import AppUpdateListener from "@/components/general/AppUpdateListener";
import {
  setLinkComponent,
  setModalComponent,
  setProjectContext,
  setRouterHook,
  UIProvider,
} from "@repo/ui";
import { LinkWrapper } from "@/components/general/LinkWrapper";
import { useIonRouterWrapper } from "@/components/general/hooks/useIonRouterWrapper";
import { IonModalWrapper } from "@/components/general/IonModalWrapper";
import { setupWrapper } from "@repo/wrapper";
import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
import { Device } from "@capacitor/device";
import { createCapacitorAsyncStorage } from "@/util/asyncStorage";
import { QueryProgressBar } from "@/components/general/QueryProgressBar";
import { UI_PRESENTER_REGISTRY } from "@/components/registry";
import { MANTINE_THEME } from "@/components/theme.tsx";

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
  serverUrl: import.meta.env.VITE_PUBLIC_SERVER_URL!,
  searchUrl: import.meta.env.VITE_PUBLIC_SEARCH_URL!,
});
setupWrapper({
  serverBaseURL: import.meta.env.VITE_PUBLIC_SERVER_URL!,
  searchBaseURL: import.meta.env.VITE_PUBLIC_SEARCH_URL!,
});

setupIonicReact({
  backButtonIcon: "/img/icon/icon_back_button.svg",
});

const App: React.FC = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            staleTime: 1000 * 60 * 60, // 1 hour
            retry: 3,
            gcTime: 1000 * 60 * 60 * 24 * 14, // 2 weeks
          },
        },
      }),
  );
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: createCapacitorAsyncStorage(),
      throttleTime: 1000,
    }),
  );

  useEffect(() => {
    (async () => {
      const info = await Device.getInfo();
      if (info.platform === "android" && Number(info.osVersion) >= 14) {
        await EdgeToEdge.enable();
        await EdgeToEdge.setBackgroundColor({
          color: "#1f1f1f",
        });
      } else {
        await EdgeToEdge.disable(); // Prevents layout issues on older Android versions
      }
    })();
  }, []);

  useEffect(() => {}, []);

  return (
    <IonApp>
      <UIProvider presenters={UI_PRESENTER_REGISTRY}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister }}
        >
          <SuperTokensProvider>
            <MantineProvider theme={MANTINE_THEME} forceColorScheme={"dark"}>
              <IonReactRouter>
                <AppUrlListener />
                <AppUpdateListener />
                <NotificationsManager />
                <QueryProgressBar />
                <Tabs />
              </IonReactRouter>
            </MantineProvider>
          </SuperTokensProvider>
        </PersistQueryClientProvider>
      </UIProvider>
    </IonApp>
  );
};

export default App;
