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
import SuperTokensProvider from "./components/auth/SuperTokensProvider";
import NotificationsManager from "./components/general/NotificationsManager";
import AppUrlListener from "./components/general/AppUrlListener";
import Tabs from "./Tabs";
import AppUpdateListener from "@/components/general/AppUpdateListener";
import { setProjectContext, UIProvider } from "@repo/ui";
import { setupWrapper } from "@repo/wrapper";
import { EdgeToEdge } from "@capawesome/capacitor-android-edge-to-edge-support";
import { Device } from "@capacitor/device";
import { createCapacitorAsyncStorage } from "@/util/asyncStorage";
import { UI_HOOK_REGISTRY, UI_PRESENTER_REGISTRY } from "@/components/registry";
import { MANTINE_THEME } from "@/components/theme.tsx";
import { PostHogProvider } from "@repo/analytics";

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

/**
 * dayjs setup
 */
dayjs.extend(RelativeTime);
dayjs.extend(LocalizedFormat);

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
            refetchOnMount: false,
            refetchOnReconnect: false,
            staleTime: 1000 * 60 * 60, // 1 hour
            retry: 3,
            gcTime: Infinity,
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

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // 30 days
        maxAge: 1000 * 60 * 60 * 24 * 30,
      }}
    >
      <IonApp>
        <MantineProvider theme={MANTINE_THEME} forceColorScheme={"dark"}>
          <UIProvider
            presenters={UI_PRESENTER_REGISTRY}
            hooks={UI_HOOK_REGISTRY}
          >
            <SuperTokensProvider>
              <PostHogProvider
                appName={"mobile"}
                posthogKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY!}
                posthogHost={import.meta.env.VITE_PUBLIC_POSTHOG_HOST!}
              >
                <IonReactRouter>
                  <AppUrlListener />
                  <AppUpdateListener />
                  <NotificationsManager />
                  <Tabs />
                </IonReactRouter>
              </PostHogProvider>
            </SuperTokensProvider>
          </UIProvider>
        </MantineProvider>
      </IonApp>
    </PersistQueryClientProvider>
  );
};

export default App;
