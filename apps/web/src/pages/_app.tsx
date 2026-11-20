import { MantineProvider, mergeMantineTheme } from "@mantine/core";

import { RouterTransition } from "@/components/general/RouterTransition";
import GlobalAppShell from "@/components/general/shell/GlobalAppShell";
import { PostHogProvider, protectOAuthPage } from "@repo/analytics";
import {
  HydrationBoundary,
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import RelativeTime from "dayjs/plugin/relativeTime";
import type { AppProps } from "next/app";
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
import "@mantine/nprogress/styles.css";
import "@mantine/spotlight/styles.css";
import "@mantine/tiptap/styles.css";

/**
 * Theme tokens for every Mantine, Ionic and Tailwind variable. Must come after
 * Mantine and before the app globals so `:root[data-theme]` wins.
 */
import "@repo/ui/themes.css";

/**
 * Includes tailwind styles
 */
import "@/components/globals.css";

/*
 * YARL
 */
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/styles.css";

import { useNextRouterWrapper } from "@/components/general/hooks/useNextRouterWrapper";
import { LinkWrapper } from "@/components/general/LinkWrapper";
import NotificationsManager from "@/components/general/NotificationsManager";
import { OpenGraph } from "@/components/general/OpenGraph";
import OpenInAppDialog from "@/components/general/OpenInAppDialog";
import { preloadStoredTheme } from "@/components/theme/preloadStoredTheme";
import { ThemePackStyles } from "@/components/theme/ThemePackStyles";
import { webThemeStorage } from "@/components/theme/themeStorage";
import { WebThemeRuntime } from "@/components/theme/WebThemeRuntime";
import type { DehydrationResult } from "@/util/types/hydration";
import { I18nProvider, type SupportedLanguage } from "@repo/locales";
import {
  AppThemeProvider,
  DEFAULT_MANTINE_THEME,
  ErrorBoundaryFallback,
  getAuthClientOptions,
  handleAuthError,
  setProjectContext,
  setupAuthClient,
  UIProvider,
} from "@repo/ui";
import { setupWrapper } from "@repo/wrapper";
import { Inter, Roboto } from "next/font/google";
import { useCallback, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";

// TypeScript's DOM library does not declare the Cookie Store API yet.
declare const cookieStore: {
  set(options: { name: string; value: string }): Promise<void>;
};

function getLocaleFromPath(
  asPath: string,
  defaultLocale?: string,
): SupportedLanguage | undefined {
  const pathname = asPath.split("?")[0];
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (firstSegment === "pt-BR" || firstSegment === "en") {
    return firstSegment;
  }

  return defaultLocale as SupportedLanguage | undefined;
}

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  style: ["normal", "italic"],
  weight: ["300", "400", "500", "600", "700"],
});

/**
 * Xbox falls back to Inter after Segoe UI (see the generated `--gn-font`).
 * `preload: false` keeps it off the critical path: the font file is requested
 * only when a theme's stack actually reaches it, so `gamenode` never downloads
 * it. The family name is exposed as `--gn-font-inter` on `:root` below.
 */
const inter = Inter({
  subsets: ["latin"],
  preload: false,
  display: "swap",
});

/**
 * dayjs setup
 */
dayjs.extend(RelativeTime);
dayjs.extend(LocalizedFormat);

setProjectContext({
  client: "web",
  s3BucketUrl: process.env.NEXT_PUBLIC_S3_BUCKET_URL!,
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL!,
  searchUrl: process.env.NEXT_PUBLIC_SEARCH_URL!,
  // `next dev` only; production builds inline "production" here and drop it
  debugUserId:
    process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_DEBUG_USER_ID || undefined
      : undefined,
});
setupAuthClient(getAuthClientOptions(process.env.NEXT_PUBLIC_SERVER_URL!));
setupWrapper({
  searchBaseURL: process.env.NEXT_PUBLIC_SEARCH_URL!,
  serverBaseURL: process.env.NEXT_PUBLIC_SERVER_URL!,
});

// Start the stored theme's lazy packs as early as the client bundle allows.
// Conditional: `gamenode` and first visits import nothing.
preloadStoredTheme();

type WebAppProps = AppProps<DehydrationResult> & {
  /** Server-rendered theme from `_document`; absent on static/client renders. */
  initialTheme?: string;
};

export default function WebApp({
  Component,
  pageProps,
  router,
  initialTheme,
}: WebAppProps) {
  useEffect(() => {
    router.events.on("routeChangeStart", protectOAuthPage);
    router.events.on("routeChangeComplete", protectOAuthPage);
    router.events.on("routeChangeError", restorePrivacy);
    function restorePrivacy() {
      protectOAuthPage(window.location.href);
    }
    return () => {
      router.events.off("routeChangeStart", protectOAuthPage);
      router.events.off("routeChangeComplete", protectOAuthPage);
      router.events.off("routeChangeError", restorePrivacy);
    };
  }, [router.events]);
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

  const locale =
    (router.locale as SupportedLanguage | undefined) ||
    getLocaleFromPath(router.asPath, router.defaultLocale);

  const handleLanguageChange = useCallback(
    (lang: SupportedLanguage) => {
      if (router.locale === lang) return;

      void router.push(
        {
          pathname: router.pathname,
          query: router.query,
        },
        undefined,
        {
          locale: lang,
          scroll: false,
        },
      );

      void cookieStore.set({
        name: "NEXT_LOCALE",
        value: lang,
      });
    },
    [router],
  );

  useEffect(() => {
    if (!locale || router.locale === locale) return;

    void router.replace(
      {
        pathname: router.pathname,
        query: router.query,
      },
      undefined,
      {
        locale,
        scroll: false,
      },
    );
  }, [locale, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <PostHogProvider
        appName={"web"}
        posthogKey={process.env.NEXT_PUBLIC_POSTHOG_KEY!}
        posthogHost={process.env.NEXT_PUBLIC_POSTHOG_HOST!}
      >
        <I18nProvider language={locale} onLanguageChange={handleLanguageChange}>
          <MantineProvider
            theme={mergeMantineTheme(DEFAULT_MANTINE_THEME, {
              fontFamily: roboto.style.fontFamily,
            })}
            forceColorScheme={"dark"}
          >
            <UIProvider
              presenters={{
                Link: LinkWrapper,
              }}
              hooks={{
                useRouter: useNextRouterWrapper,
                authPath: "/auth",
                themeStorage: webThemeStorage,
              }}
            >
              <AppThemeProvider initialTheme={initialTheme}>
                <WebThemeRuntime />
                <ThemePackStyles />
                <Head>
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                  />
                  {/*
                   * Font variables must be on `:root` (the element where the
                   * generated `--gn-font` resolves); a wrapper div would not
                   * reach it. GameNode points at the self-hosted Roboto family
                   * from `globals.css`; Xbox uses the generated stack.
                   */}
                  <style
                    dangerouslySetInnerHTML={{
                      __html: `:root{--gn-font-inter:${inter.style.fontFamily};--gn-font-roboto:${roboto.style.fontFamily}}`,
                    }}
                  />
                </Head>
                {/* Default title and link-preview tags; pages override them. */}
                <OpenGraph title="GameNode" links={false} />
                <NotificationsManager />
                <OpenInAppDialog />
                <HydrationBoundary state={pageProps.dehydratedState}>
                  <GlobalAppShell>
                    <RouterTransition />
                    <ErrorBoundary
                      fallbackRender={({ error }) => (
                        <ErrorBoundaryFallback error={error as Error} />
                      )}
                    >
                      {/* keyed by pathname so each page fades in, but query changes (search) don't replay it */}
                      <div
                        key={router.asPath.split(/[?#]/)[0]}
                        className="motion-safe:animate-gn-fade-in"
                      >
                        <Component {...pageProps} />
                      </div>
                    </ErrorBoundary>
                  </GlobalAppShell>
                </HydrationBoundary>
              </AppThemeProvider>
            </UIProvider>
          </MantineProvider>
        </I18nProvider>
      </PostHogProvider>
    </QueryClientProvider>
  );
}
