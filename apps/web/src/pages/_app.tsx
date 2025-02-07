import { MantineProvider, mergeMantineTheme, Modal } from "@mantine/core";
import { AppProps } from "next/app";
import SuperTokensProvider from "@/components/auth/SuperTokensProvider";
import GlobalAppShell from "@/components/general/shell/GlobalAppShell";
import React, { useState } from "react";
import { RouterTransition } from "@/components/general/RouterTransition";
import {
  DehydratedState,
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
} from "@tanstack/react-query";
import Head from "next/head";
import { OpenAPI as ServerOpenAPI } from "@repo/wrapper/server";
import { OpenAPI as SearchOpenAPI } from "@repo/wrapper/search";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  style: ["normal", "italic"],
  weight: ["300", "500", "700"],
});

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

import NotificationsManager from "@/components/general/NotificationsManager";
import MatomoWrapper from "@/components/general/MatomoWrapper";
import OpenInAppDialog from "@/components/general/OpenInAppDialog";
import {
  DEFAULT_MANTINE_THEME,
  setRoutingComponent,
  setRoutingManager,
} from "@repo/ui";
import { LinkWrapper } from "@/components/general/LinkWrapper.tsx";
import { useRouter } from "next/router";
import { setupWrapper } from "@repo/wrapper";
import { Roboto } from "next/font/google";
import { setProjectContext } from "@repo/ui";

/**
 * Basic configuration for wrapper services
 */
ServerOpenAPI.BASE = process.env.NEXT_PUBLIC_SERVER_URL!;
ServerOpenAPI.WITH_CREDENTIALS = true;
SearchOpenAPI.BASE = process.env.NEXT_PUBLIC_SEARCH_URL!;

setRoutingComponent(LinkWrapper);
setRoutingManager(useRouter);
setProjectContext({
  client: "web",
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
          <NotificationsManager />
          <OpenInAppDialog />
          <MatomoWrapper>
            <GlobalAppShell>
              <HydrationBoundary state={pageProps.dehydratedState}>
                <RouterTransition />
                <Component {...pageProps} />
              </HydrationBoundary>
            </GlobalAppShell>
          </MatomoWrapper>
        </QueryClientProvider>
      </SuperTokensProvider>
    </MantineProvider>
  );
}
