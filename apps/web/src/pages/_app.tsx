import { MantineProvider, mergeMantineTheme } from "@mantine/core";
import { AppProps } from "next/app";
import SuperTokensProvider from "@/components/auth/SuperTokensProvider";
import GlobalAppShell from "@/components/general/shell/GlobalAppShell";
import React, { useState } from "react";
import { RouterTransition } from "@/components/general/RouterTransition";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Head from "next/head";
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

/*
 * YARL
 */
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import NotificationsManager from "@/components/general/NotificationsManager";
import OpenInAppDialog from "@/components/general/OpenInAppDialog";
import {
  DEFAULT_MANTINE_THEME,
  setProjectContext,
  setLinkComponent,
  setRouterHook,
} from "@repo/ui";
import { LinkWrapper } from "@/components/general/LinkWrapper";
import { setupWrapper } from "@repo/wrapper";
import { Roboto } from "next/font/google";
import MatomoTracker from "@/components/general/MatomoTracker";
import { useNextRouterWrapper } from "@/components/general/hooks/useNextRouterWrapper";
import { DehydrationResult } from "@/util/types/hydration";

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
dayjs.extend(LocalizedFormat);

setLinkComponent(LinkWrapper);
setRouterHook(useNextRouterWrapper);
setProjectContext({
  client: "web",
  s3BucketUrl: process.env.NEXT_PUBLIC_S3_BUCKET_URL!,
});
setupWrapper({
  searchBaseURL: process.env.NEXT_PUBLIC_SEARCH_URL!,
  serverBaseURL: process.env.NEXT_PUBLIC_SERVER_URL!,
});

export default function App({
  Component,
  pageProps,
}: AppProps<DehydrationResult>) {
  const [queryClient, _] = useState(
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

  return (
    <MantineProvider
      theme={mergeMantineTheme(DEFAULT_MANTINE_THEME, {
        fontFamily: roboto.style.fontFamily,
      })}
      forceColorScheme={"dark"}
    >
      <Head>
        <title>GameNode</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SuperTokensProvider>
        <QueryClientProvider client={queryClient}>
          <MatomoTracker />
          <NotificationsManager />
          <OpenInAppDialog />
          <HydrationBoundary state={pageProps.dehydratedState}>
            <GlobalAppShell>
              <RouterTransition />
              <Component {...pageProps} />
            </GlobalAppShell>
          </HydrationBoundary>
        </QueryClientProvider>
      </SuperTokensProvider>
    </MantineProvider>
  );
}
