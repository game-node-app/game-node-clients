import React, { useEffect, useState } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import {
  defaultShouldDehydrateQuery,
  MutationCache,
  onlineManager,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { MantineProvider } from "@mantine/core";
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import NotificationsManager from "./components/general/NotificationsManager";
import AppUrlListener from "./components/general/AppUrlListener";
import Tabs from "./Tabs";
import AppUpdateListener from "@/components/general/AppUpdateListener";
import LiveUpdateListener from "@/components/general/LiveUpdateListener";
import WrappedWidgetSync from "@/components/wrapped/WrappedWidgetSync";
import DailyWidgetSync from "@/components/daily/DailyWidgetSync";
import EntrySplash from "@/components/general/splash/EntrySplash";
import {
  getAuthClientOptions,
  handleAuthError,
  setProjectContext,
  SettingsModal,
  setupAuthClient,
  SupporterThemeProvider,
  UIProvider,
} from "@repo/ui";
import { I18nProvider } from "@repo/locales";
import { setupWrapper } from "@repo/wrapper";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import {
  getCapacitorAuthToken,
  withCapacitor,
} from "better-auth-capacitor/client";
import {
  createCapacitorAsyncStorage,
  holdWritesUntilSplashDone,
} from "@/util/asyncStorage";
import {
  THEME_FALLBACK_PRESENTERS,
  UI_HOOK_REGISTRY,
  UI_PRESENTER_REGISTRY,
} from "@/components/registry";
import { MANTINE_THEME } from "@/components/theme.tsx";
import { mobileThemeStorage } from "@/theme/theme-storage";
import { NativeThemeChrome } from "@/theme/use-native-theme-chrome";
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
/**
 * Theme tokens for every Mantine, Ionic and Tailwind variable. Must come after
 * the Ionic stylesheets so `:root[data-theme]` wins over `:root.md`/`:root.ios`
 * and before the app globals (`globals.css`) and overrides (`variables.css`).
 */
import "@repo/ui/themes.css";
/* Non-themed Ionic settings; the palette is generated in @repo/ui/themes.css. */
import "./theme/variables.css";

/**
 * Includes tailwind styles. Last, so utilities override Ionic/theme defaults.
 */
import "@/components/globals.css";
/*
 * YARL
 */
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Network } from "@capacitor/network";
import { shouldRetryQuery } from "@/util/shouldRetryQuery";
import { useLanguagePreference } from "@/components/general/hooks/useLanguagePreference";

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

// Native: cookies don't reach the API from the WebView origin, so the session travels as a bearer token.
const CAPACITOR_AUTH_STORAGE = {
  storagePrefix: "gamenode",
  cookiePrefix: "better-auth",
};
const isNative = Capacitor.isNativePlatform();
const authClientOptions = getAuthClientOptions(
  import.meta.env.VITE_PUBLIC_SERVER_URL!,
);
setupAuthClient(
  isNative
    ? (withCapacitor(authClientOptions, {
        scheme: "app.gamenode",
        ...CAPACITOR_AUTH_STORAGE,
      }) as typeof authClientOptions)
    : authClientOptions,
);
setupWrapper({
  serverBaseURL: import.meta.env.VITE_PUBLIC_SERVER_URL!,
  searchBaseURL: import.meta.env.VITE_PUBLIC_SEARCH_URL!,
  getToken: isNative
    ? () =>
        getCapacitorAuthToken(CAPACITOR_AUTH_STORAGE).then(
          (t) => t ?? undefined,
        )
    : undefined,
});

setupIonicReact({
  backButtonIcon: "/img/icon/icon_back_button.svg",
});

const App: React.FC<{ initialTheme?: string | null }> = ({ initialTheme }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleAuthError }),
        mutationCache: new MutationCache({ onError: handleAuthError }),
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            refetchOnMount: true,
            refetchOnReconnect: true,
            retry: shouldRetryQuery,
            gcTime: Infinity,
          },
        },
      }),
  );
  const [persister] = useState(() =>
    createAsyncStoragePersister({
      storage: holdWritesUntilSplashDone(createCapacitorAsyncStorage()),
      throttleTime: 1000,
    }),
  );

  const [language, onLanguageChange] = useLanguagePreference();

  useEffect(() => {
    // Stale key from the previous auth provider; harmless, but no reason to keep it.
    Preferences.remove({ key: "frontendCookies" }).catch(console.error);
  }, []);

  useEffect(() => {
    Network.addListener("networkStatusChange", (status) => {
      onlineManager.setOnline(status.connected);
    }).catch(console.error);

    return () => {
      Network.removeAllListeners().catch(console.error);
    };
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // 30 days
        maxAge: 1000 * 60 * 60 * 24 * 30,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.meta?.persist !== false && defaultShouldDehydrateQuery(query),
        },
      }}
    >
      <IonApp>
        <EntrySplash />
        <I18nProvider
          language={language ?? "en"}
          onLanguageChange={(lang) => {
            onLanguageChange(lang);
          }}
        >
          <MantineProvider theme={MANTINE_THEME} forceColorScheme={"dark"}>
            <UIProvider
              presenters={UI_PRESENTER_REGISTRY}
              hooks={UI_HOOK_REGISTRY}
            >
              <SupporterThemeProvider
                initialTheme={initialTheme}
                themeStorage={mobileThemeStorage}
                fallbackPresenters={THEME_FALLBACK_PRESENTERS}
                suspendOnInitialPack={false}
              >
                <NativeThemeChrome />
                <PostHogProvider
                  appName={"mobile"}
                  posthogKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY!}
                  posthogHost={import.meta.env.VITE_PUBLIC_POSTHOG_HOST!}
                  // CapacitorHttp sends binary bodies as text, which breaks gzip.
                  disableCompression={isNative}
                >
                  <IonReactRouter>
                    <AppUrlListener />
                    <AppUpdateListener />
                    <LiveUpdateListener />
                    <WrappedWidgetSync />
                    <DailyWidgetSync />
                    <NotificationsManager />
                    <Tabs />
                    {/*
                      Mobile host for `?settings=<tab>` links, including the
                      notifications gear: the web shell mounts the same shared
                      modal once.
                    */}
                    <SettingsModal />
                  </IonReactRouter>
                </PostHogProvider>
              </SupporterThemeProvider>
            </UIProvider>
          </MantineProvider>
        </I18nProvider>
      </IonApp>
    </PersistQueryClientProvider>
  );
};

export default App;
