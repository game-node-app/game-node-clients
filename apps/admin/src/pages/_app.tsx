import { DashboardLayout } from "@/components/general/DashboardLayout";
import { useNextRouterWrapper } from "@/components/general/hooks/useNextRouterWrapper";
import { LinkWrapper } from "@/components/general/LinkWrapper";
import { MantineProvider } from "@mantine/core";
import { I18nProvider } from "@repo/locales";
import {
  DEFAULT_MANTINE_THEME,
  getAuthClientOptions,
  handleAuthError,
  NotificationsManager,
  setProjectContext,
  setupAuthClient,
  UIProvider,
} from "@repo/ui";
import { setupWrapper } from "@repo/wrapper";
import type { DehydratedState } from "@tanstack/react-query";
import {
  HydrationBoundary,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import type { AppProps } from "next/app";
import { Roboto } from "next/font/google";
import Head from "next/head";
import { useState } from "react";

/**
 * Should always be imported BEFORE tailwind.
 */
import "@mantine/carousel/styles.css";
import "@mantine/charts/styles.css";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/tiptap/styles.css";
import "mantine-react-table/styles.css";

/**
 * Includes tailwind styles
 */
import "@/components/globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  style: ["normal", "italic"],
  weight: ["300", "500", "700"],
});

/**
 * dayjs setup
 */
dayjs.extend(RelativeTime);
setProjectContext({
  client: "admin",
  s3BucketUrl: process.env.NEXT_PUBLIC_S3_BUCKET_URL!,
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL!,
  searchUrl: process.env.NEXT_PUBLIC_SEARCH_URL!,
});
setupAuthClient(getAuthClientOptions(process.env.NEXT_PUBLIC_SERVER_URL!));
setupWrapper({
  searchBaseURL: process.env.NEXT_PUBLIC_SEARCH_URL!,
  serverBaseURL: process.env.NEXT_PUBLIC_SERVER_URL!,
});

export interface DehydrationResult {
  dehydratedState?: DehydratedState;
}

export default function App({
  Component,
  pageProps,
}: AppProps<DehydrationResult>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({ onError: handleAuthError }),
        mutationCache: new MutationCache({ onError: handleAuthError }),
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

  return (
    <UIProvider
      presenters={{
        Link: LinkWrapper,
      }}
      hooks={{
        useRouter: useNextRouterWrapper,
        authPath: "/auth",
      }}
    >
      <I18nProvider language={"en"}>
        <MantineProvider
          theme={DEFAULT_MANTINE_THEME}
          forceColorScheme={"dark"}
        >
          <Head>
            <title>GameNode</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <QueryClientProvider client={queryClient}>
            <NotificationsManager />
            <DashboardLayout>
              <HydrationBoundary state={pageProps.dehydratedState}>
                <Component {...pageProps} />
              </HydrationBoundary>
            </DashboardLayout>
          </QueryClientProvider>
        </MantineProvider>
      </I18nProvider>
    </UIProvider>
  );
}
