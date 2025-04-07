import { MantineProvider, mergeMantineTheme } from "@mantine/core";
import { AppProps } from "next/app";
import SuperTokensProvider from "@/components/auth/SuperTokensProvider";
import React, { useState } from "react";
import {
  DehydratedState,
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import Head from "next/head";
import dayjs from "dayjs";
import RelativeTime from "dayjs/plugin/relativeTime";
import {
  DEFAULT_MANTINE_THEME,
  NotificationsManager,
  setProjectContext,
  setRoutingComponent,
  setRoutingManager,
} from "@repo/ui";
import { LinkWrapper } from "@/components/general/LinkWrapper";
import MatomoWrapper from "@/components/general/MatomoWrapper";
import { useRouter } from "next/router";
import { setupWrapper } from "@repo/wrapper";
import { Roboto } from "next/font/google";
import { DashboardLayout } from "@/components/general/DashboardLayout";
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

setRoutingComponent(LinkWrapper);
setRoutingManager(useRouter);
setProjectContext({
  client: "web",
  s3BucketUrl: process.env.NEXT_PUBLIC_S3_BUCKET_URL!,
});
setupWrapper({
  searchBaseURL: process.env.NEXT_PUBLIC_SEARCH_URL!,
  serverBaseURL: process.env.NEXT_PUBLIC_SERVER_URL!,
});

export interface DehydrationResult {
  dehydratedState: DehydratedState;
}

export default function App({
  Component,
  pageProps,
}: AppProps<DehydrationResult>) {
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
          <MatomoWrapper />
          <NotificationsManager />
          <DashboardLayout>
            <HydrationBoundary state={pageProps.dehydratedState}>
              <Component {...pageProps} />
            </HydrationBoundary>
          </DashboardLayout>
        </QueryClientProvider>
      </SuperTokensProvider>
    </MantineProvider>
  );
}
